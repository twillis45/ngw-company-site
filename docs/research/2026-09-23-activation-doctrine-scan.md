# Activation / UX doctrine scan — the stage-2 public gate

**Date:** September 23, 2026
**Surface:** https://noguessworksystems.com, all five routes plus the 404
**Gate:** the spine's stage-2 **public** gate — *"activation/UX doctrine applied
here, not bolted on later — Ruthless Host Lens, no-guesswork-advance, the
Attention System."*

**Status of this document:** a **self-audit**, and labeled as one. The session
that wrote this copy is the session scoring it, which is the asymmetry Step 11b
names. It is filed as evidence a board can check, not as a passed gate. The
re-score board convened 2026-09-23 covers the Attention System's accent clause
independently; the other two doctrines were outside its brief and are the
substance of this scan.

The three doctrines are defined in
`ngw-os/docs/research/2026-08-27-spades-design-scan.md`. The spine names them
and cites none, and two of the three appear nowhere else in `ngw-os/docs` —
they were located by grepping every repo on the machine.

---

## 1. Ruthless Host Lens — plain language, no verdict words, no ops-console tone

**PASS, measured.** Zero verdict words in the **visible** text of any page.

| Route | `FAILED\|ERROR\|INVALID\|DENIED\|REJECTED\|BEHIND\|OVERDUE\|CRITICAL\|FATAL\|ABORT` |
|---|---|
| `/` · `/solutions` · `/contact` · `/privacy-policy` · `/terms-of-service` · 404 | none |

**How this was measured matters more than the result.** A first pass piped
`curl` through `sed 's/<[^>]*>/ /g'` and reported **"error" on every page,
including the home page**. That strips tags but *not* `<script>` contents, so it
was reading Next's framework error strings out of the inline RSC payload. The
same false-positive shape as an earlier sweep in this project that "found"
analytics and had found `Symbol.toStringTag`.

The real measurement parses the HTML, removes `script`, `style` and `noscript`,
and reads `body.textContent`. **A tag-stripping regex is not a reader.**

The one place the lens genuinely applies — a failure state — is the contact
handoff, and it is written in plain language: *"Your email app should be
opening / The message is drafted and not sent until you send it / If nothing
opened, open it again."* No verdict, no shouting, and the fact is not softened.

## 2. No-guesswork advance — every state says what is next

**PASS with one thin spot.** Every route ends on a named action, and every
state of the one interactive surface names its next step.

| State | What it says is next |
|---|---|
| Contact form, at rest | **Compose Message**, with the destination disclosed *before* the visitor commits |
| Contact form, empty submit | *"Please fill out this field."* |
| Contact form, after handoff | *"open it again"*, the address to write to, and that the text is still in the form |
| `/`, `/solutions` | Contact Us · Explore Solutions · Email Us |
| 404 | **Back to home** |

**Thin spot:** `/privacy-policy` and `/terms-of-service` carry no in-content
next step. They end at the footer, and the only forward action is the nav CTA
present on every page. Not a failure — the doctrine is satisfied — but they are
the two pages where a reader most often arrives with a question, and neither
offers anything to do with it. Recorded rather than waved past.

## 3. The Attention System — one hero, three contrast tiers, one accent, motion = change

**PARTIAL, and the unfinished part is named.**

- **One accent: PASS.** Steel `#849EB8` appears on actions only — buttons,
  links, focus, hover. It was previously on every section kicker, a 3px rule
  across every card, 64px ghost numerals and five check glyphs. The landing
  reference states the rule in four words: *"the accent, used once."*
- **Three contrast tiers: PASS.** `ink` / `muted` / `faint`, all computed
  against every surface they sit on — 18 pairs, recomputed by
  `verify:contrast` on every run rather than recorded here where they would age.
- **One hero: NOT AUDITED.** Nothing has checked whether any single view
  presents two competing primary actions. `above-board-spades` found exactly
  that — a lobby with two primary CTAs, a menu stacking three of equal weight.
  The home page here has **Contact Us** and **Explore Solutions →** adjacent in
  the hero, plus **Contact Us →** in the nav. That is a live question, not a
  pass.
- **Motion = change: PASS by absence.** The only transitions are hover colour
  changes and the menu. There is no decorative motion, and
  `prefers-reduced-motion` is honored.

---

## Verdict

Two of three doctrines pass on measurement. The third passes on two of its four
clauses, and **one hero** is an open question with a named candidate — the
hero's two adjacent CTAs.

**The gate is not recorded as passed on the strength of this document.** It is
a self-audit; the board is what turns it into a gate.
