# Admin / operator surface

The question this answers is not "what does a dashboard show." It is narrower:
**what can an operator of this site not currently see or do?**

For a static marketing site with no accounts and no database, the operator is
Todd, and the honest answer is that the surface is thin by design — but the
gaps below were not design, they were absence nobody had written down.

Status is what was **read**, not what was assumed. NOT BUILT means a grep found
nothing and a reading found nothing.

## See it

| Item | Status | Where |
|---|---|---|
| Whether the build is currently green | **BUILT** | `npm run verify:all` — 5 gates, entry point coverage asserted |
| Whether any gate is decorative | **BUILT** | `npm run redproof` — 6 faults, each watched going red |
| Whether the shipped export contains a placeholder | **BUILT** | `scripts/gates/verify-placeholders.mjs` |
| Whether the live origin sends security headers | **BUILT** | `scripts/gates/verify-headers.mjs` — reads production, exits 2 if unreachable |
| Whether the deployed commit matches local HEAD | **NOT BUILT** | Render reports no build hash on a static site. The only proxy is the `last-modified` response header. |
| Site traffic, referrers, which page converts | **NOT BUILT** | No analytics of any kind. Verified: zero tracker code in all shipped chunks, zero `Set-Cookie` on every page. |
| **How many people tried to contact the company** | **NOT BUILT, AND NOT RECOVERABLE** | See below. |
| Whether a deploy broke a page | **NOT BUILT** | No CI, no uptime check, no error tracking. |

### The item that matters most, and why it cannot be answered

Between 2026-03-27 and 2026-09-23 the contact form POSTed to a placeholder
relay ID that returned HTTP 404, and showed "Message sent. We'll be in touch
soon." on **every** path — `fetch` resolves on a 404, so the success branch ran,
and the `catch` that also set success was never reached.

**No record of those attempts exists anywhere**, and that is structural:

- The relay never had a form under that ID, so it stored nothing, and there is
  no account to inspect.
- The site has no backend and no analytics.
- The POST went **browser → relay directly**. It never traversed Cloudflare or
  Render, so neither proxy nor origin ever saw a submission.

The only obtainable figure is Cloudflare's server-side pageview count for
`/contact`, which is an **upper bound on who could have tried**, not who did —
and free-plan retention is ~30 days, so the March–August window is gone.

## Do it

| Item | Status | Notes |
|---|---|---|
| Ship a copy change | **PARTIAL** | Requires a code change, a build and a push. No CMS. |
| Roll back a bad deploy | **NOT BUILT** | Render dashboard only; no documented procedure. |
| Take the site down | **NOT BUILT** | Cloudflare dashboard only. |
| Audit log of who changed what | **BUILT** | `git log`. It is the only mutation path, which is why this row is honest rather than aspirational. |

## Gate

The console is verified against real state, not an empty one: `npm run redproof`
reintroduces each of six real faults and asserts the gate covering it goes red.
It found two things on its first run that reading could not have — one gate that
had gone **blind** when its subject's markup changed shape, and two faults that
were **inert** and had been reported as blind gates. Both look identical from an
exit code.
