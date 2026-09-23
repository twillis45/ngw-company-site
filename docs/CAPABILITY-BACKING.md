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
| `Custom Systems Design` | The same two bodies of work, plus the shipped product surfaces in this portfolio. | Same prohibition. "Fit-for-purpose systems for the places off-the-shelf tools do not fit" describes what is built; it does not assert someone bought it. |
| `Custom Business Systems` | **The same capability under a second name** — this is what the Solutions page calls it while the home page says `Custom Systems Design`. Found by this gate on its first run, 2026-09-23. | Same prohibition. **And the two names should be reconciled:** one capability with two public names is a small claim-integrity problem of its own, since a reader cannot tell whether they are one offering or two. Recorded rather than silently renamed, because which name survives is the owner's call. |

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
