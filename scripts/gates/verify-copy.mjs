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

import { shippedFiles, requireExport, report } from "./lib.mjs";

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

report(`copyright year is current (${YEAR}) and present on every page`, failures, files.length);
