// Gate: nothing placeholder, stubbed or unfinished reaches the shipped export.
//
// Scoped to the whole tree on purpose (spine Step 5e). The bug that prompted
// this gate lived in ContactForm.tsx; a gate that named ContactForm.tsx could
// only ever confirm that one fix. This one finds the next one.

import { shippedFiles, sourceFiles, requireExport, report } from "./lib.mjs";

const MARKERS = [
  /formspree\.io\/f\/PLACEHOLDER/i,
  /\bPLACEHOLDER\b/,
  /\bLOREM IPSUM\b/i,
  /\bYOUR_[A-Z_]+_HERE\b/,
  /\bTODO:/,
  /\bFIXME\b/,
  /\bXXX_/,
  /example\.com\/(api|form|endpoint)/i,
];

requireExport();

const failures = [];
const files = [...shippedFiles(), ...sourceFiles()];

for (const f of files) {
  for (const re of MARKERS) {
    const m = f.text.match(re);
    if (m) {
      const line = f.text.slice(0, m.index).split("\n").length;
      failures.push(`${f.rel}:${line} — placeholder marker ${JSON.stringify(m[0])}`);
    }
  }
}

report("no placeholders reach production", failures, files.length);
