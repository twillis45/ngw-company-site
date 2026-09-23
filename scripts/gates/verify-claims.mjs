// Gate: every sentence the SHIPPED site says about this company survives the
// claim ledger.
//
// The ledger at ngw-consulting/case-studies/CLAIM-LEDGER.md records that no
// external client has received either body of consulting work, and prohibits
// the words "client", "engagement" and "delivered to" for them. The site was
// written throughout in the voice of a firm that had done both, and a board
// rated thirteen capability sentences unsubstantiated.
//
// The prohibition is on the FACT ASSERTED, not on three words: "We help
// organizations" is the same assertion with the noun swapped, which is why the
// firm-voice patterns below are part of this gate and not a style preference.
//
// THREE assertion families, and the third is the one that matters most:
//
//   1. No asserted OUTCOME. These claim a result delivered to somebody.
//   2. No FIRM-VOICE. These claim a practice that has done the work.
//   3. ABSENCE. The gate fails if it read fewer than five pages, or if the
//      honest anchor sentence is missing from the home page. Without this a
//      future markup change makes the gate green while it measures nothing —
//      which verify:copy already did once, passing on every page after React
//      began emitting the year as separate text nodes.

import { shippedFiles, requireExport, report, stripComments } from "./lib.mjs";

requireExport();

// Asserted outcomes — each claims a result for someone. None is measured
// anywhere in the portfolio and no external client is on record.
const OUTCOMES = [
  "Better operational visibility",
  "Faster, more informed decision-making",
  "Less manual effort and fewer bottlenecks",
  "More consistent execution across teams",
  "Systems designed for real-world business use",
];

// Firm-voice: asserts a practice that has delivered.
const FIRM_VOICE = [
  [/\bwe help (organizations|businesses|companies|teams|clients)\b/i, "asserts delivery to a population"],
  [/\bour (focus|approach) is\b/i, "asserts an established practice"],
  [/\bwe (build|design|develop|deliver)\b/i, "asserts work performed for someone"],
  [/\bclients?\b/i, "prohibited by the claim ledger"],
  [/\bengagements?\b/i, "prohibited by the claim ledger"],
  [/delivered to/i, "prohibited by the claim ledger"],
];

// The honest anchor. Present tense describing INTENT, not delivery.
const ANCHOR = "was created to help";
const MIN_PAGES = 5;

const failures = [];
const pages = shippedFiles().filter((f) => f.rel.endsWith(".html"));
let checked = 0;

for (const f of pages) {
  const text = stripComments(f.text).replace(/<[^>]+>/g, " ");
  checked++;

  for (const claim of OUTCOMES) {
    if (text.includes(claim)) {
      failures.push(`${f.rel} — asserted outcome with nothing behind it: "${claim}"`);
    }
  }
  for (const [re, why] of FIRM_VOICE) {
    const m = text.match(re);
    if (m) failures.push(`${f.rel} — firm-voice ${JSON.stringify(m[0])}: ${why}`);
  }
}

// 3. ABSENCE. This gate must not be able to pass by reading nothing.
checked++;
if (pages.length < MIN_PAGES) {
  failures.push(
    `only ${pages.length} page(s) read, expected at least ${MIN_PAGES} — ` +
      `this gate cannot pass on an export it did not find`
  );
}

checked++;
const home = pages.find((f) => /out\/index\.html$/.test(f.rel));
if (!home) {
  failures.push("out/index.html not found — the home page was not read at all");
} else if (!stripComments(home.text).replace(/<[^>]+>/g, " ").includes(ANCHOR)) {
  failures.push(
    `out/index.html — the honest anchor "${ANCHOR}" is GONE. Either the About ` +
      `section was rewritten, or its markup changed shape and this gate can no ` +
      `longer see it. Both mean this gate stopped measuring.`
  );
}

report("every shipped claim survives the claim ledger", failures, checked);
