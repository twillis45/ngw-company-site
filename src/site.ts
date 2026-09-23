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
