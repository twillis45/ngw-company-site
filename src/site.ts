// Company facts that appear on more than one surface.
//
// These lived as literals in Footer.tsx and contact/page.tsx. Two copies of a
// fact are two chances for it to be wrong, and both were: the published
// address was the SUPERSEDED Dun & Bradstreet value, which COMPANY-REGISTER
// flags as the leading cause of Apple organization-enrollment rejection, while
// the register's verified Maryland Principal Office of record said otherwise.
//
// Address of record verified 2026-08-27 against the Maryland Principal Office;
// ruled for public display by the owner 2026-09-23.

export const site = {
  legalName: "No Guesswork Systems LLC",
  shortName: "No Guesswork Systems",
  email: "info@noguessworksystems.com",
  domain: "noguessworksystems.com",
  // ASSUMPTION (owner-held, undo = edit these two strings). The name is taken
  // from the repo's own git identity and the owner's address; the role line is
  // the board's recommendation, chosen because a role is a STATUS, not an
  // outcome — nothing for verify:claims to refuse. The owner ruled 2026-09-23
  // for a name and role WITHOUT a photograph, so no portrait ships and the
  // gate asserts none. That is a recorded decision, not an omission.
  //
  // This closes clause (b) of the portfolio gate — "who is behind it" — which
  // was the single RED clause: the site named no human being anywhere.
  principal: {
    name: "Todd Willis",
    role: "Principal",
  },
  address: {
    street: "306 W Redwood St, STE 201",
    cityStateZip: "Baltimore, MD 21201",
  },
  // Derived at build time, not typed by hand. The footer read "© 2025" for the
  // whole of 2026 — and 2025 predates the LLC's own formation (2026-02-26).
  // verify:copy fails when the deployed build crosses into a new year, which
  // turns "remember to update the year" into "the gate tells you to rebuild".
  get year() {
    return new Date().getFullYear();
  },
} as const;
