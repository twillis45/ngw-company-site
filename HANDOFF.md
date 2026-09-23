# HANDOFF — ngw-company-site

**Measured state, 2026-09-23.** Numbers here are re-read, not remembered.

| | |
|---|---|
| Repo | `twillis45/ngw-company-site` (**public**) |
| HEAD at write | `37cdb69` |
| Live at | https://noguessworksystems.com — Cloudflare proxy in front of a **Render** origin |
| Stack | Next.js 16.2.1 static export (`output: "export"`), React 19, Tailwind 4, TypeScript 6 |
| Node | **≥ 20.9 required.** Pinned in `engines` + `.nvmrc`. The build fails hard below it and nothing said so before. |
| Gates | **12**, all reachable from `verify:all` **and from CI** (both asserted, not eyeballed). **11 PASS, 1 FAIL** — the one red is `verify:headers`, owner-held |
| CI | `.github/workflows/verify.yml` — **green on `d5762c1`** (run 35872315248), the last commit that changed code. `gates (code)` and `red-proof` block; `live origin` is continue-on-error and RED by design until the edge rule lands, re-read daily by cron. **While one gate is permanently non-blocking, a green CI does not mean what it appears to** — the owner ruling on that is open |
| Red-proofs | **34 cases, 34 as expected, 0 NOT as expected, 0 unevaluated** — 28 file-mutation cases in `redproof.mjs` plus 6 generated origin cases. They run **in CI**, so each fault is reintroduced on a clean runner rather than only on this machine. Two of the newest first scored `?`: they broke the BUILD, so the gate never ran, and **an unevaluated case is not a result** — both were rewritten to compile and still be wrong |
| Newest gates | `verify:identity` (the site names who is behind it, and the JSON-LD agrees), `verify:hero` (exactly one hero *action* per route — counts destinations, not elements) |

## Spine position

Gates **0 through 7** recorded 2026-09-23, all `passed-with-conditions`. Before
today this project had **zero** gates and was invisible to the tracker, because
the repo had never been cloned into `~/Code`.

Stage 9 applies **retroactively** — the
surface has been public since 2026-03-27 and has passed none of its four public
gates. Stages 8 and 10 are unreached.

## Path artifact

| | |
|---|---|
| Name | **Thanked and Discarded** |
| URL | https://claude.ai/artifact/VHZk1nx6VrNRFmAmxEUuot |
| Source | `docs/artifact/thanked-and-discarded.html` — edit and republish THIS file so the URL stays stable |
| Watch | confirmed 2026-09-23T04:56:47.802Z — connected, armed by a publish, auto-replies armed |
| Measured | 11 stages · 89 rows · 82 checkboxes · 5 markers · 43 handled · 12 open · 25 NOT RUN · 4 unreached · 0 sideways scroll · 0 JS errors |
| Stamp | `data-recorded="2026-09-23T05:23:48.335Z"`, equal to the newest gate record's `recordedAt` |

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
- **The browser pane reports `clientWidth: 0` while it is hidden**, so every
  layout measurement taken then is meaningless — including `sideScroll`. Check
  `tabs_context` for "pane is hidden" before trusting a geometry number.
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

- **The three "established" Reddit access facts in this repo's research were
  all wrong**, and relaying them as facts cost two dispatched agents most of
  their budget. Verified corrections: `-A 'Mozilla/5.0'` returns **403**, a full
  Chrome UA returns 200; `search.rss` and `comments/<id>.rss` return 200 **only
  in bare form** — attaching `limit`/`sort`/`t` triggers 429 (`top.rss`
  tolerates them); `old.reddit.com/comments/<id>/.json` returns **200 with a
  "Welcome to Reddit" HTML interstitial**, which is a soft block, not a route.
  The sustained ceiling is **~1 request per 3–5 min per IP and it is global
  across concurrent agents** — running three in parallel poisoned it for all
  three. Serialize.
- **A gate that checks visible copy must use `visibleText()` from
  `scripts/gates/lib.mjs`**, never a bare tag strip. Three gates were caught
  passing on markup no reader sees: the firm voice in `<meta>` (a meta tag has
  no text content), and then `verify:copy` satisfied by `streetAddress` inside
  the Organization JSON-LD after that block was added. A naive `/<[^>]+>/`
  strip turns every `<script>` into body text.

## Open — owner items

| # | Item | Why it is yours |
|---|---|---|
| 1 | **Security headers.** `verify:headers` is RED: no HSTS, CSP, Referrer-Policy or X-Frame-Options. | Cloudflare/Render dashboard change. Exact config ready to paste: `docs/SECURITY-HEADERS.md`. |
| 2 | **Capability copy.** `ngw-consulting/case-studies/CLAIM-LEDGER.md` prohibits "client", "engagement" and "delivered to" for the only consulting work that exists — and the site is written throughout in the voice of a firm that has done both. | A factual ruling: is there a named past engagement? If not, the About section's "was created to help" voice is already honest and on the page. |
| 3 | **Whether to contact anyone who wrote in** during the outage. | There is no list. See `docs/ADMIN-CONSOLE.md`. |
| 4 | **Analytics: adopt one or keep none.** | Keeping none is free and the policy now says so truthfully. Adding one acquires a consent obligation. |
| 5 | **Positioning.** The demand scan returned NO-GO on the current category language as a converting asset. | Strategy, not code. |
| 6 | **The two worked problems aim at territory that is solved or empty.** Two open-discovery passes (600 Reddit posts, 440 HN comments, 843 Ramp reviews, 100 Expensify reviews). Expense reconciliation: the incumbent **structurally excludes your segment** — Ramp's own docs require a corporation/LLC/LP, **$25,000 in a business bank account**, and no free email, and refuse sole proprietors outright; its unhappy reviewers are 14 *forced* users against 6 owners, two of whom were bounced at signup. Cross-tool governance: **no buyer-side footprint at all**. | Under PORTFOLIO this does **not** make the page dishonest — the worked problems prove real work with real checks, not a market. It changes what to *build*. Your call whether to act. |
| 7 | **Run the open-discovery unlock, or accept PORTFOLIO on the record.** | The board: *an unlock nobody intends to run is a decayed BLOCKED wearing a better label.* Either answer is legitimate; silence is not. |
| 8 | **May `verify:headers` stay `continue-on-error`?** | While one gate is permanently non-blocking, a green CI does not mean what it appears to. |
| 9 | **Which of the two contact paths is the hero** — `/contact` or the raw `mailto:`. | Shipped as a stated assumption (`/contact`), undo recorded in `src/app/page.tsx`. Two-token edit. |

### Demand findings worth keeping, measured

| Finding | Number | Source |
|---|---|---|
| What solo operators actually pay for accounting | **$300–$1,500 per YEAR** | Three separate HN buyers, self-reported |
| What vendors quote for the same | **$300–800 per MONTH** | Vendor-published; a 10–20× gap, not a negotiation |
| Invoice **creation** apps, iOS ratings | 122,755 / 105,762 / 92,966 — all free | App Store |
| Apps that **chase** payment, iOS ratings | **0, 0, 0 and 2** | Four launched in 2026; five orders of magnitude |
| Revenue a solo operator loses to non-payment | **~3–5%** | An 18-year freelancer, HN 34401740 |
| SOP/documentation **product** supply | Trainual 50 ratings / **0 written**; Process Street 26; Waybook 0 | The one struggle with money and no product — but buyers **buy a person, not a tool** (1,000+ EOS implementers at $36–53k/client-yr) |
| Reddit absence claims, discount factor | r/smallbusiness AutoModerator **removes market-research posts** by policy | Quiet there may be moderation, not absent pain |

**RESOLVED 2026-09-23.** `reddit.com/comments/1r9x049.rss` was fetched on a
cooled IP after ~20 failed attempts across two agents — HTTP 200, 137,958
bytes, **146 entries**. The kill condition was registered *before* the fetch:
name Trainual, SweetProcess or Scribe and the wedge is dead.

| Across 126 substantive replies | count |
|---|---|
| documentation language | 22 |
| hire a person / second-in-command | 16 |
| **named software products** | **0** |

Both apparent product hits were inspected by hand and are false positives — the
English word "notion", and the **book** *Traction*, recommended by a commenter
who sells this as consulting. **The wedge is open, not saturated.**

What operators recommend is nearer this company's own thesis than any tool:
not a document but a **measurement** — *"write down everything you do, every
call on your time, in a given day. That'll tell you what you're being called on
most often for."* And: *"leave again — that's a method for discovering where the
cracks are."*

**Four limits, and they matter.** (1) One thread is one source, however many
commenters. (2) The classification is a regex over *mentions*, not a reading of
recommendations — only the zero is exact, because every hit was inspected. (3)
Absence of product mentions fits two stories, and the supply side favours the
second: the money here buys a **person** (1,000+ EOS implementers at $36–53k per
client-year, against Trainual's 50 iOS ratings and 0 written reviews). (4)
r/smallbusiness removes market-research posts by policy — that discounts every
*other* absence claim from that sub, though not this thread, which is an owner
posting his own experience.

**This is not a GO.** It clears the kill condition and nothing more; the shape
it points at is services, not product, and the owner has not ruled.

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

## The stage-2 public gate is runnable — here is where its doctrine lives

The spine's stage-2 public gate reads *"activation/UX doctrine applied here, not
bolted on later — Ruthless Host Lens, no-guesswork-advance, the Attention
System."* It **names all three and cites none**, and two of them appear nowhere
else in `ngw-os/docs/`. Found only by grepping every repo — and
`above-board-spades/HANDOFF.md:771` records "grep for …" as its method too, so
this has cost someone else the same hour.

They are defined in **`ngw-os/docs/research/2026-08-27-spades-design-scan.md`**:

| Doctrine | What it actually requires |
|---|---|
| **Ruthless Host Lens** | Plain language. No verdict words, no ops-console tone. |
| **No-guesswork advance** | Every state says what is next. |
| **Attention System** | One hero, three contrast tiers, one accent, motion = change. |

`above-board-spades` is the worked example of running this gate properly and
filing the result to a design-scan doc rather than asserting it.

**What is already true here, and what is not.** The Attention System's accent
clause is honored — steel appears only on actions. The other two are **NOT RUN**:
nothing has audited this site for verdict tone, and nothing has checked that
every state says what is next. The contact form's handoff panel is the one
surface that now does.

## Re-score board, 2026-09-23 — scores and what holds each cap

Overall **5.3**, cap by code alone **7.6**. The cap column is the useful half:
a dimension at its cap is **finished for the builder**, and grinding at it is
the expensive mistake.

| Dimension | Score | Cap | What holds the cap |
|---|---|---|---|
| Gate correctness | 7.3 | 9.5 | **Owner ruling** — may `verify:headers` stay `continue-on-error`? While one gate is permanently non-blocking, a green CI does not mean what it appears to. |
| Claim integrity | 5.4 | 8.2 | **Owner ruling ×2** — which offering name survives; whether the five ✓ sentences and "Every AI agency sells more" may be asserted at all. A gate can enforce a ledger; it cannot decide what the ledger supports. |
| Accessibility | 5.6 | 9.0 | **Real users** — VoiceOver and NVDA on the status panel and the open menu. Whether an injected live region announces is an empirical fact about assistive tech, not a property of the source. |
| Brand conformance | 4.5 | 5.5 | **Owner ruling ×2** — what mark replaces the old one (an identity decision, not a code fix); which of the two home CTAs is the hero. |
| Security posture | 3.8 | 6.0 | **Owner action outside this repo** — no file in this tree can set a response header. |

**A process finding against this session, and it is fair:** five commits were
pushed to `main` — which auto-deploys — *while the board was scoring*,
including fixes to three of the five findings it had been asked to rank. It
refused to score a moving tree and extracted a clean one. Step 4e requires the
builder not to write the score; it also requires the builder to hold still.
**Do not ship to `main` while a board is sitting.**

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
