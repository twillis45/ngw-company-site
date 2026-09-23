# HANDOFF — ngw-company-site

**Measured state, 2026-09-23.** Numbers here are re-read, not remembered.

| | |
|---|---|
| Repo | `twillis45/ngw-company-site` (**public**) |
| HEAD at write | `37cdb69` |
| Live at | https://noguessworksystems.com — Cloudflare proxy in front of a **Render** origin |
| Stack | Next.js 16.2.1 static export (`output: "export"`), React 19, Tailwind 4, TypeScript 6 |
| Node | **≥ 20.9 required.** Pinned in `engines` + `.nvmrc`. The build fails hard below it and nothing said so before. |
| Gates | **13**, all reachable from `verify:all` **and from CI** (both asserted, not eyeballed). **12 PASS, 1 FAIL** — the one red is `verify:headers`, owner-held |
| CI | `.github/workflows/verify.yml` — **green on `d5762c1`** (run 35872315248), the last commit that changed code. `gates (code)` and `red-proof` block; `live origin` is continue-on-error and RED by design until the edge rule lands, re-read daily by cron. **While one gate is permanently non-blocking, a green CI does not mean what it appears to** — the owner ruling on that is open |
| Red-proofs | **42 cases, 42 as expected, 0 NOT as expected, 0 unevaluated** — 28 file-mutation cases in `redproof.mjs` plus 6 generated origin cases. They run **in CI**, so each fault is reintroduced on a clean runner rather than only on this machine. Two of the newest first scored `?`: they broke the BUILD, so the gate never ran, and **an unevaluated case is not a result** — both were rewritten to compile and still be wrong |
| Newest gates | `verify:identity` (the site names who is behind it, and the JSON-LD agrees), `verify:hero` (exactly one hero *action* per route — counts destinations, not elements), `verify:geometry` (real Chromium at 375/768/1280 — tap targets and document overflow) |
| Browser dep | `playwright@1.58.0` **devDependency**, added for `verify:geometry`. CI installs chromium. The gate cannot exist without a real layout engine, and it must run in CI or `verify:coverage` refuses it. |

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
- **Presence is not correctness, and a gate can be green on a defect worse
  than the one it prevents.** `verify:affordance` asserted that the substring
  `aria-current=` appeared in `Navbar.tsx`. It was there — on three mobile
  links all copy-pasted to `pathname === "/"`, so on `/solutions` and
  `/contact` a screen-reader user was told they were on Home. Found by a
  dispatched audit that drove the open menu; no substring test could have
  caught it.
- **A fix can pass the very probe it was written against.** The first fix for
  the `verify:hero` bypass used `text.indexOf(tag)` to find each control's
  label — and `indexOf` returns the first match every time, while two identical
  tags are exactly the shape of that bypass. Third inert fix this session. Run
  the probe; never trust the fix.
- **Gates render first paint unless you make them do otherwise.**
  `verify:geometry` was green while the open phone menu carried 32px targets,
  because it never clicked the hamburger. It drives interactive states now.
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

## Trademark — the premise on record was wrong

The primary USPTO register had returned **HTTP 403** to every prior attempt, so
this project's record rested on secondary reconnaissance. Reached 2026-09-23 by
driving `tmsearch.uspto.gov` in a browser — it is client-rendered, so `curl`
returns a JS shell with zero matches in the HTML. **55 results for "guesswork".**

**The record said** `NO GUESSWORK` is a live class-9 mark held by No Guess Work
LLC, and a board built an argument on it. **Serial 88748555, that registrant,
classes 009/016, is DEAD / ABANDONED.**

The live exposures are different parties:

| Mark | Serial | Status | Classes | Owner |
|---|---|---|---|---|
| NO GUESSWORK | 99676351 | **LIVE / PENDING** | 009, 041, 044 | Rameck Hunt (individual) |
| **NO GUESSWORK. ONLY GROWTH.** | 99184248 | **LIVE / REGISTERED** | **035** marketing services | Scorpion Enterprises, LLC |
| SKIP THE GUESSWORK | 99582874 | LIVE / PENDING | 009, 035, 041, 042, 045 | MATCHAMINT LLC |
| MORE CLARITY, LESS GUESSWORK | 99619651 | LIVE / PENDING | 009, 035, 036, 042 | Claritev Corporation |

Class 035 is business and marketing services — arguably **nearer this
consultancy's actual services than class 009 ever was**. The field is crowded
(live registrations across classes 003, 033, 035, 037), which cuts both ways:
weaker individual marks, more parties with standing to oppose.

**Still not a clearance, and recorded PARTIAL against the skill's own bar.** The
recitations are truncated in the results view rather than read verbatim;
incontestability, renewal status, field-of-use limits, and *which class this
entity would file in* are all still open. No common-law or state rights, no
likelihood-of-confusion analysis. **Needs a trademark attorney before anything
ships under the mark or any application is filed.**

**Two traps worth keeping.** An early "No results found" was the UI **not having
run the search**, not an empty register. And the search executes only on the
button — Return does not submit it. A check that reports nothing may simply not
have run.

## Open — owner items

| # | Item | Why it is yours |
|---|---|---|
| 1 | **Lock, renew and DNSSEC-sign `noguessworksystems.com`.** Measured live 2026-09-23: status `["active"]` — no transfer, delete or update lock — `delegationSigned: false`, **138 days to expiry**. `noguesswork.com` (the trademark holder's) carries all four locks and is signed; `toddwillisphoto.com` carries a transfer lock and runs to 2029. **The entity domain is the least protected thing in the portfolio**, and it gates Apple enrollment, `info@`, `admin@` and every product subdomain. | Registrar account — yours alone. Order: **renew first** (some registrars require unlocking to renew), verify the registrant email is current (ICANN suspends on a bouncing contact regardless of locks), then set transfer/delete/update. **Do NOT set `clientRenewProhibited` — it blocks renewal.** DNSSEC last and separately: Cloudflare generates the DS record, the registrar publishes it, and a wrong DS record — or moving DNS without removing it first — takes the domain dark. Verify with `node scripts/watch-domain-posture.mjs`. |
| 1b | **Security headers.** `verify:headers` is RED: no HSTS, CSP, Referrer-Policy or X-Frame-Options. | Cloudflare/Render dashboard change. Exact config ready to paste: `docs/SECURITY-HEADERS.md`. |
| 2 | **Capability copy.** `ngw-consulting/case-studies/CLAIM-LEDGER.md` prohibits "client", "engagement" and "delivered to" for the only consulting work that exists — and the site is written throughout in the voice of a firm that has done both. | A factual ruling: is there a named past engagement? If not, the About section's "was created to help" voice is already honest and on the page. |
| 3 | **Whether to contact anyone who wrote in** during the outage. | There is no list. See `docs/ADMIN-CONSOLE.md`. |
| 4 | **Analytics: adopt one or keep none.** | Keeping none is free and the policy now says so truthfully. Adding one acquires a consent obligation. |
| 5 | **Positioning.** The demand scan returned NO-GO on the current category language as a converting asset. | Strategy, not code. |
| 6a | **The demand ranking was built on a population nobody checked, and it corrects toward your own thesis.** r/HVAC 2% ops content, Construction 3%, Plumbing 2%, Electricians 2% — against **r/sweatystartup at 49%**. A 20× gap across four independent communities: the trades subs are technicians and homeowners, not owners. And "getting paid" is **zero** in the owner-dense sub's top 100. Reading the threads that should have rescued it: the owner is not being stiffed, he is being **paid late by design**, having written terms that make him his client's lender. Every reply says restructure the billing; **nobody suggests a collections tool** — which is why every collect-side product measured has zero users. They are built for the downstream half, and the downstream half is already free. | **So "getting paid" and "it all lives in my head" collapse into one thing: an operating decision the owner made once, in their head, and never wrote down.** Services-shaped, not product-shaped. Three kill conditions: 95% of the decisive thread's advice was *behavioural*, not tooling — these owners don't think they have a software problem; one thread is one source; and the price band runs $22 to $52,800 for a nominally identical outcome, so whoever sells here defines the deliverable or gets compared to a Gumroad template. |
| 6 | **The two worked problems aim at territory that is solved or empty.** Two open-discovery passes (600 Reddit posts, 440 HN comments, 843 Ramp reviews, 100 Expensify reviews). Expense reconciliation: the incumbent **structurally excludes your segment** — Ramp's own docs require a corporation/LLC/LP, **$25,000 in a business bank account**, and no free email, and refuse sole proprietors outright; its unhappy reviewers are 14 *forced* users against 6 owners, two of whom were bounced at signup. Cross-tool governance: **no buyer-side footprint at all**. | Under PORTFOLIO this does **not** make the page dishonest — the worked problems prove real work with real checks, not a market. It changes what to *build*. Your call whether to act. |
| 7 | **Run the open-discovery unlock, or accept PORTFOLIO on the record.** | The board: *an unlock nobody intends to run is a decayed BLOCKED wearing a better label.* Either answer is legitimate; silence is not. |
| 8 | **May `verify:headers` stay `continue-on-error`?** | While one gate is permanently non-blocking, a green CI does not mean what it appears to. |
| 9 | **The wedge that cleared its kill condition has no observable PRICE.** Operators call SOPs "100% necessary" and none names a figure they paid; every price in that space came from a seller. Operational *hiring* produced clean buyer prices at once — $30/hr, $25/hr, $42k/yr, $5/hr. | Two readings this evidence cannot separate: no transaction market exists because people buy a **person**, or those buyers have not been looked at. Named next step: comment trees (not the post index) against r/smallbusiness, r/agency, r/msp, r/EOSTraction. |
| 10 | **Which of the two contact paths is the hero** — `/contact` or the raw `mailto:`. | Shipped as a stated assumption (`/contact`), undo recorded in `src/app/page.tsx`. Two-token edit. |

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

| Across 122 distinct commenters | count |
|---|---|
| named a product | **2 (1.6%)** |
| hire / delegate to a person | 7 |
| document it yourself, by hand | 17 |
| agreement with no answer at all | ~96 |

**Every funded category leader scores zero** — Trainual, SweetProcess, Scribe,
Tango, Process Street, Whale, Waybook, Guru, Confluence, Loom, Document360,
Tettra, Nuclino, ClickUp, Asana, Trello, Airtable. Two independent passes agree
on that. What *is* named: Google Docs once, inside a reply flagged as a vendor
plug, and a self-built GPT twice. The two remedies actually offered are two
**books**. **The wedge is open, not saturated.**

**Correction to this file's own earlier claim.** It read *"zero software
products across 126 replies"* — too strong. "Notion" in this thread is the
English word (*"resigned myself to the notion of"*) and **both** passes counted
it as the product; Google Docs is real and I had missed it. The verdict held;
the phrasing did not. Re-derivable because the corpus is committed at
`docs/research/2026-09-23-owner-in-the-head-thread.rss`.

### The control — the one number here with something behind it

The obvious objection to any absence finding is that the classifier is broken.
It was tested against a positive control: **same subreddit, same year, same
"how do you handle X without losing your mind" question shape, same
classifier** — employee expense management, **61 distinct commenters, 21
naming a product** (Ramp 13, Expensify 4, Concur 2, Divvy, Dext, QuickBooks,
QBO, Zoho Expense, Rippling).

**34% product-naming in the control against 1.6% in the test.** The instrument
discriminates; the silence is a property of that market, not of the parsing.

**What it does not settle:** either those products have a distribution problem
so severe they are unknown to their exact buyer, or they do not solve what this
person has. Both are wedge-shaped, and they imply **different products**.

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
