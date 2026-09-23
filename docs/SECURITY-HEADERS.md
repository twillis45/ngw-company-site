# Security headers — the one gate that is still red, and how to close it

`npm run verify:headers` fails today: **24 of 30 assertions**, across all five
routes plus a static asset. The live origin sends only `x-content-type-options`.

| Header | Missing means |
|---|---|
| `strict-transport-security` | A first request can be downgraded to `http` before the redirect fires. |
| `content-security-policy` | Any injected script executes with full privileges. |
| `referrer-policy` | Full URLs leak to every third party linked from the page. |
| `x-frame-options` | The site can be framed for clickjacking. |

## Corrections to the first version of this document

A dispatched security review on 2026-09-23 found three things wrong here. They
are corrected below rather than quietly rewritten, because two of them would
otherwise have stopped anyone revisiting the decision.

**1. "This cannot be fixed from this repo." FALSE, and it was the worst of the
three.** Render static sites accept a `headers:` block in a `render.yaml`
blueprint. That is **strictly better** than a Cloudflare dashboard rule: it is
version-controlled, reviewable in a diff, and — the part that matters — it ships
**atomically with the build**. See the caveat under option B before acting.

**2. "Tightening the CSP needs a nonce, which a static export cannot mint."
FALSE.** CSP *hashes* are exactly the static-export answer, and were measured
working: a `<script>` whose SHA-256 was listed executed, while an unhashed
injected script was blocked — that second result being the proof the policy was
actually enforcing rather than being ignored.

**3. But the conclusion survives, for a reason the first version never gave.**
On rebuild, **6 of 35 inline-script hashes change**, because Next embeds a
random build ID in the RSC payload. So with headers pinned in a *dashboard*
rule — decoupled from the build — a hash allowlist blanks the page on the next
deploy. `'unsafe-inline'` stays on `script-src` **until headers deploy
atomically with the artifact**, which is what option B buys. The right call for
the wrong reason is still a trap: it survives exactly until someone checks it.

## The header set

```
strict-transport-security   max-age=31536000; includeSubDomains
referrer-policy             strict-origin-when-cross-origin
x-frame-options             DENY
x-content-type-options      nosniff
content-security-policy     default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self'; font-src 'self'; img-src 'self'; connect-src 'self'; form-action 'none'; frame-ancestors 'none'; base-uri 'none'; object-src 'none'
```

Four directives are tighter than the first draft, each because it was **measured**
rather than reasoned about:

- **`style-src` drops `'unsafe-inline'`.** Zero `<style>` blocks and zero
  `style=` attributes ship across all seven pages, and the Navbar's
  `document.body.style.overflow` write is **not** governed by `style-src` — a
  CSSOM property assignment is not an inline style. Verified in a browser.
- **`img-src` drops `data:`.** Zero `data:` URIs ship.
- **`base-uri` is `'none'`**, not `'self'` — no `<base>` element is used.
- **`object-src 'none'`** is stated explicitly; `default-src 'self'` would still
  permit plugin content from the origin.

Two live constraints to keep in view:

- **`form-action 'none'` is correct today and dangerous later.** Measured: the
  current form works (it calls `preventDefault` and sets `location.href`), while
  a native submit — the no-JS path, and any future real backend — is **blocked**,
  and the user sees nothing. That is the exact silent-failure class this site
  just escaped. If a form backend is ever added, this directive must name its
  origin in the same commit.
- **React 19's style-hoisting path ships** in the bundle. It is not exercised
  today, but a future `<style precedence>` would be blocked by the tightened
  `style-src`. `verify:headers` is what will catch that.

## Two ways to apply it

**Option A — Cloudflare Transform Rule.** Rules → Transform Rules → Modify
Response Header → Create, applied to all incoming requests. Fastest, and needs
no deploy. It is a **dashboard** change: invisible to code review, and it does
not ship with the build, which is why hashes cannot be used with it.

**Option B — `render.yaml` with a `headers:` block. Preferred.** Version
controlled, reviewable, atomic with the build, and the precondition for ever
dropping `'unsafe-inline'`.

> **Caveat, and it is not hypothetical.** This service was created from the
> dashboard, not from a blueprint. `COMPANY-REGISTER.md` records what went wrong
> the last time a `render.yaml` met a dashboard-created service on this account:
> changing `name:` on a connected blueprint can make Render create a **new**
> service and orphan the old one, and `app.noguessworksystems.com` is a CNAME
> straight at the origin. Add the blueprint with the service's **existing** name
> and settings, or convert deliberately with the DNS in view. Do not let a
> blueprint rename anything.

Enable HSTS from SSL/TLS → Edge Certificates as well, so it survives a rule change.

**`preload` is deliberately not in the set above.** It belongs there eventually —
without it the very first plaintext request is still interceptable, which is the
threat HSTS exists to close. But `includeSubDomains` binds **every** subdomain,
and preload is effectively irreversible. Confirm every subdomain is HTTPS first;
`app.` is today, and it is the one handling payments.

## Verifying

```bash
npm run verify:headers
```

It reads the **live origin**, not any file in this tree — a config file is not
evidence about production. It asserts **values, not presence**: `max-age=0`
disables HSTS and is refused, `default-src *` is refused, `unsafe-url` is
refused, `ALLOWALL` is refused. The first version of this gate checked presence
alone and would have passed every one of those. And it enumerates **every route
in `out/` plus a static asset**, because a rule scoped to a path pattern would
otherwise leave six of seven routes bare with the gate still green.

It exits **2**, not 0, when the origin is unreachable: a gate that cannot reach
its subject has not passed.

## Not this repo, but found alongside and worth carrying

- **`app.noguessworksystems.com` ships a CSP but no HSTS and no
  `frame-ancestors`/`X-Frame-Options`** — a payment-handling app that can be
  framed. Different repo; raise it there.
- **The CAA records are malformed.** Three entries nest the whole record line
  inside the value: `0 issue "0 issue \"sectigo.com\""`. Sectigo is therefore
  **not validly authorized**, and there is no `iodef` contact. Cloudflare DNS.
- **SPF is `~all`** and its `a`/`mx` mechanisms authorize the apex's shared
  anycast addresses. **No DKIM selector could be verified** — do not assume one
  is configured.
