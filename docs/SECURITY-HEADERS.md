# Security headers — the one gate that is still red, and how to close it

`npm run verify:headers` fails today. That is correct: the live origin sends
only `x-content-type-options`. Four headers a public business site owes are
absent, measured on a cache MISS against `https://noguessworksystems.com`:

| Header | Missing means |
|---|---|
| `strict-transport-security` | A first request can be downgraded to `http` before the redirect fires. |
| `content-security-policy` | Any injected script executes with full privileges. |
| `referrer-policy` | Full URLs leak to every third party linked from the page. |
| `x-frame-options` | The site can be framed for clickjacking. |

**This cannot be fixed from this repo.** The static export has no server, and
the two places that can attach a header are both dashboard-configured:

- **Cloudflare** sits in front (`server: cloudflare`, the domain's NS are
  `nile`/`megan.ns.cloudflare.com`).
- **Render** is the origin (`rndr-id` present on a cache MISS; there is no
  `x-vercel-id` on any response — the stale `.vercel/project.json` in the
  `~/Documents` clone describes an abandoned March deploy target, not
  production).

## Cloudflare Transform Rule — the shortest path

Rules → Transform Rules → **Modify Response Header** → Create. Apply to *All
incoming requests*, and set four static headers:

```
strict-transport-security   max-age=31536000; includeSubDomains
referrer-policy             strict-origin-when-cross-origin
x-frame-options             DENY
content-security-policy     default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; form-action 'none'; frame-ancestors 'none'; base-uri 'self'
```

Two notes on that CSP, because both would otherwise cause a silent breakage or
a false sense of coverage:

- `'unsafe-inline'` on `script-src` is required by Next's inline hydration
  payload (`self.__next_f.push(...)`). Removing it blanks the page. Tightening
  it properly needs a nonce, which a static export cannot mint.
- `form-action 'none'` is safe **only** because the contact form no longer
  POSTs anywhere — it composes a `mailto:`. If a real form backend is ever
  wired up, this directive must name that origin or the form will fail
  silently, which is the exact class of failure this site just came out of.

Enable HSTS from SSL/TLS → Edge Certificates as well, so it survives a rule
change.

## Verifying

```bash
npm run verify:headers
```

It reads the live origin, not any file in this tree — a config file is not
evidence about production. It exits **2**, not 0, when the origin is
unreachable: a gate that cannot reach its subject has not passed.
