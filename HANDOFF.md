# HANDOFF — ngw-company-site

**Measured state, 2026-09-23.** Numbers here are re-read, not remembered.

| | |
|---|---|
| Repo | `twillis45/ngw-company-site` (**public**) |
| HEAD at write | `881d918d` |
| Live at | https://noguessworksystems.com — Cloudflare proxy in front of a **Render** origin |
| Stack | Next.js 16.2.1 static export (`output: "export"`), React 19, Tailwind 4, TypeScript 6 |
| Node | **≥ 20.9 required.** Pinned in `engines` + `.nvmrc`. The build fails hard below it and nothing said so before. |
| Gates | 5, all reachable from `verify:all` (coverage asserted, not eyeballed) |
| Red-proofs | 6, **all watched going red** |

## Path artifact

| | |
|---|---|
| Name | **Thanked and Discarded** |
| URL | https://claude.ai/artifact/VHZk1nx6VrNRFmAmxEUuot |
| Source | `docs/artifact/thanked-and-discarded.html` — edit and republish THIS file so the URL stays stable |
| Watch | confirmed 2026-09-23T04:56:47.802Z — connected, armed by a publish, auto-replies armed |
| Measured | 11 stages · 87 rows · 82 checkboxes · 5 markers · 27 handled · 21 open · 30 NOT RUN · 4 unreached · 0 sideways scroll · 0 JS errors |
| Stamp | `data-recorded="2026-09-23T04:47:05.129Z"`, equal to the stage-0 gate record's `recordedAt` |

## How it deploys

**Auto-deploy on push to `main`** (Render static site). There is no deploy
config in this repo — the service is dashboard-created, so the connection
exists only in the Render dashboard. Consequence, per the spine's Step 6g:
**"Deploy" is not an owner item here.** Pushing is deploying.

The check after a push is the live origin, never the dashboard. Render reports
no build hash for a static site, so the available proxy is:

```bash
curl -sI https://noguessworksystems.com/ | grep last-modified
npm run verify:all      # verify:headers reads production directly
```

## What changed on 2026-09-23

Every item below was a live falsehood on the company's public face before this.

1. **The contact form discarded every submission for ~6 months and said it had
   sent them.** It POSTed to a placeholder relay ID (HTTP 404). `fetch` resolves
   on a 404, so the *success* branch ran; the `catch` that also set success was
   never reached. **No input, outage or server response could have made that form
   report a failure.** Replaced with a `mailto:` composer — no endpoint, no
   processor, no network call, and the visitor sees the draft in their own mail
   client.
2. **Published address corrected** to `306 W Redwood St, STE 201, Baltimore, MD
   21201`, matching `ngw-os/docs/COMPANY-REGISTER.md`'s verified Maryland
   Principal Office. The site had been publishing the **superseded D&B value**
   that the register flags as the leading cause of Apple enrollment rejection.
   Ruled by the owner 2026-09-23.
3. **`© 2025` → derived at build time.** 2025 predates the LLC's own formation
   (2026-02-26).
4. **Privacy policy rewritten against what the site actually does.** It had
   claimed analytics cookies (the site sets **zero** cookies and loads **zero**
   trackers — verified in all 9 shipped chunks) and described collecting
   contact-form data that was never collected. Now also names the two real
   processors, Render and Cloudflare, and states retention and a rights route.
5. **Legal-page dates** `March 2025` → `September 2026`.
6. Added `robots.txt`, `sitemap.xml`, an icon, a designed 404, `metadataBase`
   and a canonical. All four had been 404ing.
7. Form fields given `id`/`htmlFor` — all four previously had **no accessible
   name at all**.

## Active traps

- **Node 16 is first on this machine's PATH** (`/opt/local/bin/node`). The build
  dies with a message about the required version. Use
  `export PATH=/usr/local/Cellar/node@22/22.23.2_1/bin:$PATH`.
- **`npm run build | tail` reports tail's exit status, not the build's.** A
  failed build reads as `EXIT=0`. Redirect to a file and read `$?` from the
  build itself.
- **A second clone exists at `~/Documents/ngs-company-site`** with a stale
  `.vercel/project.json`. Production is Render, not Vercel — confirmed by
  `rndr-id` on a cache MISS and the absence of `x-vercel-id`. Do not treat that
  file as evidence about production.
- **`verify:copy` went blind once already.** When the year became
  `© {site.year}`, React emitted `© <!-- -->2026` and the old regex matched
  nothing — passing on every page while measuring nothing. It now fails on
  absence. Any gate here that reports "N checked, 0 failing" should be asked
  whether it found its subject at all.

## Open — owner items

| # | Item | Why it is yours |
|---|---|---|
| 1 | **Security headers.** `verify:headers` is RED: no HSTS, CSP, Referrer-Policy or X-Frame-Options. | Cloudflare/Render dashboard change. Exact config ready to paste: `docs/SECURITY-HEADERS.md`. |
| 2 | **Capability copy.** `ngw-consulting/case-studies/CLAIM-LEDGER.md` prohibits "client", "engagement" and "delivered to" for the only consulting work that exists — and the site is written throughout in the voice of a firm that has done both. | A factual ruling: is there a named past engagement? If not, the About section's "was created to help" voice is already honest and on the page. |
| 3 | **Whether to contact anyone who wrote in** during the outage. | There is no list. See `docs/ADMIN-CONSOLE.md`. |
| 4 | **Analytics: adopt one or keep none.** | Keeping none is free and the policy now says so truthfully. Adding one acquires a consent obligation. |
| 5 | **Positioning.** The demand scan returned NO-GO on the current category language as a converting asset. | Strategy, not code. |

## Standing assumptions

- **The contact path is a `mailto:` composer, not a hosted form.** Ruled by the
  owner 2026-09-23 over the alternative of a real relay account. **Undo:** revert
  `src/components/ContactForm.tsx` and wire a real endpoint — but keep the
  `res.ok` check, or `verify:contact` will refuse it, which is the point.

- **Four service entries were removed** — "AI Decision Support" and "Operational
  Intelligence" from the home page, "AI Decision Support" and "Operational
  Reporting & Visibility" from Solutions. The stage-1 board ranked this (a) on
  the grounds that none has a backing artifact in
  `ngw-consulting/case-studies/CLAIM-LEDGER.md`, and that "Operational
  Intelligence" is additionally the term Google Suggest rewrites to "business
  intelligence consultant". This narrows the stated offering, which is the
  owner's to widen again. **Undo:** re-add the entries to the `services` array
  in `src/app/page.tsx` and the `solutions` array in
  `src/app/solutions/page.tsx` — but `verify:claims` will refuse any firm-voice
  body copy that comes back with them, which is the point.

- **The site was re-skinned to Studio Matte**, the existing NGW design system in
  `ngw-leadgen/docs/brand/`. It had shipped in navy and neon teal; that system's
  light-mode spec ends with the line *"No warm gold. No pink. No neon teal. No
  blue."* The accent is now steel `#849EB8`, used only on actions — the landing
  reference states the discipline in four words, *"the accent, used once"* — and
  kickers, card rules, ghost numerals and check glyphs no longer carry it.
  **Undo:** the token block at the top of `src/app/globals.css` is the whole
  surface; reverting it reverts the skin.

## Owner items the board named, in its ranked order

1. **Transfer-lock, renew and DNSSEC-sign `noguessworksystems.com`.** Verified
   live against RDAP 2026-09-23: status is bare `["active"]` — **no transfer
   lock, no delete lock, no update lock** — `delegationSigned: false`, expires
   **2027-02-08, 139 days out**, alone on DomainRegistry.com. Every other domain
   in the portfolio carries `client transfer prohibited` and runs to 2029. A
   lapse or transfer takes the entity name, `info@`, `admin@`, every product
   subdomain, every password-reset path and the Apple enrollment site at once.
   **The only item here with a hard deadline and an unrecoverable failure mode.**
2. Rule whether the two worked problems may be published — the only change that
   would give a referral-checker something checkable to believe.
3. **Never ship an app branded "No Guesswork" without class-9 clearance.**
   "NO GUESSWORK" is a live mark held by No Guess Work LLC for downloadable
   software, and that registrant already publishes on both stores. The board's
   source returned HTTP 403, so this is reconnaissance and **not** a clearance.
4. Run `clearance` properly.
5. Security headers — `docs/SECURITY-HEADERS.md`.
6. Analytics: a cookieless server-side referrer count, or accept that the
   declared basis stays unchecked.
7. The 180-day discarded-mail question: whether any record is recoverable
   within Cloudflare/Render retention, and whether notice is owed.
