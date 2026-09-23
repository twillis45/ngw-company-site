// Gate: factual copy on a live company site is current.
//
// The copyright year is the cheapest possible proof that a page is tended. A
// stale one is read by a visitor as "this company may not still exist" — and
// this site shipped "© 2025" for the whole of 2026, a year that predates the
// LLC's own formation.
//
// TWO things this gate learned the hard way, both from watching it under a
// reintroduced fault:
//
//  1. It must see through React's text-node separators. Once the year became
//     `© {site.year}` instead of a literal, React emitted
//     `© <!-- -->2026<!-- -->` and a regex expecting `©\s*\d{4}` matched
//     NOTHING. The gate went green on every page while measuring nothing at
//     all.
//  2. It must FAIL when it finds no copyright notice. That is what made (1)
//     invisible: "7 checked, 0 failing" reads exactly like a pass. A gate that
//     passes because its subject was absent is worse than no gate, because it
//     reports coverage it does not have.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, shippedFiles, requireExport, report, visibleText } from "./lib.mjs";

requireExport();

const YEAR = new Date().getUTCFullYear();
const failures = [];
const files = shippedFiles().filter((f) => f.rel.endsWith(".html"));

for (const f of files) {
  // Strip HTML comments so React's <!-- --> text-node separators do not hide
  // the year from the pattern.
  const text = f.text.replace(/<!--[\s\S]*?-->/g, "");

  const found = [...text.matchAll(/(?:©|&copy;|&#169;)\s*(\d{4})/g)];

  if (found.length === 0) {
    failures.push(
      `${f.rel} — NO copyright notice found. This gate cannot pass on absence: ` +
        `either the footer stopped rendering, or its markup changed shape and ` +
        `this pattern can no longer see it.`
    );
    continue;
  }

  for (const m of found) {
    const claimed = Number(m[1]);
    if (claimed !== YEAR) {
      failures.push(`${f.rel} — copyright reads ${claimed}, current year is ${YEAR}`);
    }
  }
}

// THE ADDRESS OF RECORD. The site published the SUPERSEDED Dun & Bradstreet
// value — 5000 Thayer Center, Oakland MD — on six surfaces, while the register
// recorded 306 W Redwood St, Baltimore as verified against the Maryland
// Principal Office. COMPANY-REGISTER flags the old value as the leading cause
// of Apple organization-enrollment rejection, and the owner ruled Baltimore
// correct for public display on 2026-09-23.
//
// Asserted two ways, because the second is what actually prevents a drift:
//   1. The superseded value must not appear in anything that ships.
//   2. The address that DOES ship must equal the one constant in src/site.ts,
//      so the two copies cannot diverge again — they already did once.
const SUPERSEDED = [/5000\s+Thayer/i, /Oakland,\s*MD/i, /\b21550\b/];

const siteTs = readFileSync(join(ROOT, "src/site.ts"), "utf8");
const street = (siteTs.match(/street:\s*"([^"]+)"/) || [])[1];
const cityStateZip = (siteTs.match(/cityStateZip:\s*"([^"]+)"/) || [])[1];

if (!street || !cityStateZip) {
  failures.push("src/site.ts declares no address — this gate cannot pass on a constant it did not find");
} else {
  let carriedBy = 0;
  const missing = [];
  for (const f of files) {
    const text = f.text.replace(/<!--[\s\S]*?-->/g, "");
    for (const re of SUPERSEDED) {
      if (re.test(text)) {
        failures.push(
          `${f.rel} — ships the SUPERSEDED address (${re.source}). The address of ` +
            `record is "${street}, ${cityStateZip}", owner-ruled 2026-09-23.`
        );
      }
    }
    // React splits adjacent text nodes, so match the street alone.
    //
    // visibleText, not the raw markup: the Organization JSON-LD carries
    // streetAddress on EVERY page, so a red-proof that stripped the address
    // out of the footer went green against raw HTML. A check for what a
    // reader sees has to read what a reader sees. The SUPERSEDED scan above
    // deliberately stays on raw text — a stale address hidden in structured
    // data is still a stale address shipping.
    if (visibleText(f.text).includes(street)) carriedBy++;
    else missing.push(f.rel);
  }
  // EVERY page, not merely one. The address lives in the footer, and the footer
  // is on every page — so "somewhere on the site" was a weaker invariant than
  // the design actually guarantees. A red-proof case that stripped the address
  // from the footer alone went GREEN, because /contact renders it separately
  // and kept the count above zero. The runner caught the gate being looser than
  // intended; the fault was fine.
  if (carriedBy === 0) {
    failures.push(
      `NO shipped page carries the address of record ("${street}") — either it was ` +
        `removed, or its markup changed shape and this gate can no longer see it`
    );
  } else if (missing.length) {
    failures.push(
      `${missing.length} page(s) do not carry the address of record: ${missing.join(", ")}. ` +
        `It lives in the footer, which every page renders — so a page without it means ` +
        `the footer stopped rendering there.`
    );
  }
}

report(
  `copyright year is current (${YEAR}) and the address of record ships`,
  failures,
  files.length + 2
);
