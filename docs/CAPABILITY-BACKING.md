# Capability backing

Every capability this site names in public must map to a row in
`ngw-consulting/case-studies/CLAIM-LEDGER.md`. This file is that map, and
`verify:claims` refuses any card title that ships without a row here.

**Why a file and not a word list.** The first version of the claims gate matched
forbidden phrasing — "we help organizations", "clients", "delivered to". That
catches the *voice* and misses the *substance*: a card can be worded perfectly
and still name a capability nothing backs. The board that ranked this item was
explicit — enforce the **ledger link**, not a vocabulary. A phrase list is a
check on how a claim is written; this is a check on whether it is true.

**The rule.** A row here is not permission to claim anything. It records what
the ledger actually says, including where the ledger constrains the wording.
Adding a row for a capability the ledger does not support is the one way to
defeat this gate, and it requires writing down a falsehood in a file whose only
purpose is to be checked — which is the point.

| Card title (as it ships) | Backing in the claim ledger | Constraint the ledger puts on the wording |
|---|---|---|
| `Workflow Automation` | The Asana governance-cycle work and the expense-reconciler build are both real, executed, and recorded. | **No external party has received either.** The ledger prohibits "client", "engagement" and "delivered to" for both. Describe the mechanism, never a delivered outcome. |
| `Custom Business Systems` | The Asana governance-cycle work and the expense-reconciler build, plus the shipped product surfaces in this portfolio. | Same prohibition as above: no external party has received either, so describe what is built and never assert someone bought it. |

## Worked problems

These are not capabilities. They are two problems worked end to end, published
under the claim ledger's own framing — *"worked problems, not client
engagements"* — because no outside party has received either. Every figure on
the page names its check, and every entry states where its evidence stops.

| Title (as it ships) | Backing in the claim ledger | Constraint the ledger puts on the wording |
|---|---|---|
| `Reconciling a corporate card against an expense system` | PROVEN rows 1, 2, 3, 4, 5, and 11 of `ngw-consulting/case-studies/CLAIM-LEDGER.md`: 211 assertions; the 118 → 80/25/17 split; the $1,802 short; the to-the-cent assertion at `engine.test.js:22`; zero network requests at `render.test.js:102`; and 19% calendar corroboration. | The corpus is a **fixture**, and row 2 is FALSE if presented as a forecast. The $1,802 is **synthetic and labeled**. Row 11 is proven **as a limit** — it is disclosed, never relied on. All three qualifiers ship with their figures. |
| `A governance cycle that spans several tools` | PROVEN rows 8, 9, 12 and 13, plus row 10 as PARTIAL: multi-homing on a free workspace; Starter $10.99 / Advanced $24.99; seven projects in a personal workspace; and the self-disclaimer that it was designed from a verbal description. | Row 10's arithmetic is exact and its **headcount is illustrative** — it may never be stated as anyone's actual saving. Row 13 is the anti-claim and the ledger says leave it in; it ships verbatim in the entry's limit. |

**Removing a qualifier turns a proven row into a false one.** That is the only
way to break these two entries, and it does not look like vandalism — it looks
like tightening the copy.

## One capability, one name

This offering shipped under **two** public names — `Custom Systems Design` on the
home page and `Custom Business Systems` on Solutions — so a reader could not tell
whether it was one offering or two. Found by `verify:claims` on its first run with
the ledger link enforced, and ranked by the stage-1 re-score board as the highest
remaining item after the severity-3s.

**`Custom Business Systems` survives**, on the demand scan's evidence rather than
taste: `custom systems design` returns closets, windows and solar in Google
Suggest with no consulting sense at all, while the surviving name at least carries
category signal. Assumption stated 2026-09-23; **undo** is one string in
`src/app/page.tsx` and one row here.

## Removed 2026-09-23, and why

These shipped for six months with no row here, because this file did not exist.

| Removed | Why it had no backing |
|---|---|
| `AI Decision Support` | No artifact in the ledger. The nearest thing, the lighting engine's confidence metrics, is a product feature and not a service anyone received. |
| `Operational Intelligence` | No artifact. Additionally the term Google Suggest rewrites to "business intelligence consultant", so it was also the worst of the four as a search term. |
| `Operational Reporting & Visibility` (Solutions) | The same capability under a second name. No backing either. |
| `AI Decision Support` (Solutions) | Duplicate of the above. |

Re-adding any of these means adding a row above with a real ledger citation. If
the citation does not exist, the card does not ship. That is the whole mechanism.
