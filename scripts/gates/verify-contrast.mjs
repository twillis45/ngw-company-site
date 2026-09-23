// Gate: text contrast is COMPUTED, never judged by eye.
//
// The defect this guards was real and invisible: the site's accent (#2DD4BF)
// is a fine colour on navy — 10.05:1 — and a hard WCAG 1.4.3 failure on the
// off-white section at 1.78:1, where it was used for an eyebrow label and five
// check glyphs. The same token, correct in one place and 2.5x under the bar in
// another. Nothing that looks at a palette can catch that; only compositing the
// pair can.
//
// Two assertions, because a ratio table alone is a check that cannot fail:
//
//   1. Every (foreground, surface) pair the design actually pairs is computed
//      against the WCAG threshold for its size.
//   2. The light-surface sections are grepped to prove the failing pair is not
//      reintroduced. A ratio table proves the tokens are capable of passing;
//      only this proves they are used that way.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, sourceFiles, report } from "./lib.mjs";

const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = (h) => { const [r,g,b] = [1,3,5].map(i => parseInt(h.slice(i,i+2),16));
                     return 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b); };
const ratio = (a,b) => { const l1 = lum(a), l2 = lum(b);
                         return (Math.max(l1,l2)+0.05) / (Math.min(l1,l2)+0.05); };

// Read the tokens from the stylesheet rather than restating them here. A gate
// that carries its own copy of the value it checks is testing itself.
const css = readFileSync(join(ROOT, "src/app/globals.css"), "utf8");
const token = (name) => {
  const m = css.match(new RegExp("--color-" + name + ":\\s*(#[0-9A-Fa-f]{6})"));
  if (!m) {
    // Exit 2, not 1. A gate that cannot find its subject has not failed the
    // design — it has failed to run, and collapsing those into one exit code
    // is how a crash comes to read as a finding.
    console.error(`CANNOT CHECK — token --color-${name} is not declared in globals.css.`);
    console.error("This is not a contrast failure. Declare the token, then re-run.");
    process.exit(2);
  }
  return m[1].toUpperCase();
};

// Every pair the design actually composites, with the threshold for its use.
// 4.5 is normal text; 3.0 is large text (>=24px, or >=18.66px bold).
const PAIRS = [
  ["accent",       "navy",       4.5, "accent text on the navy ground"],
  ["accent",       "charcoal",   4.5, "accent eyebrow on charcoal sections"],
  ["accent-deep",  "off-white",  4.5, "accent on the LIGHT section — the 1.78:1 failure"],
  ["cool-gray",    "navy",       4.5, "body text on navy"],
  ["cool-gray",    "charcoal",   4.5, "body text on charcoal"],
  ["light-gray",   "navy",       4.5, "nav links"],
  ["navy",         "accent",     4.5, "button label on the accent fill"],
  ["navy",         "off-white",  4.5, "headings on the light section"],
];

const failures = [];
let checked = 0;

for (const [fg, bg, min, why] of PAIRS) {
  checked++;
  const r = ratio(token(fg), token(bg));
  if (r < min) {
    failures.push(
      `${fg} (${token(fg)}) on ${bg} (${token(bg)}) = ${r.toFixed(2)}:1, needs ${min} — ${why}`
    );
  }
}

// 2. The failing pair must not come back. Scope every light-surface section and
//    assert the bright accent is not used for text inside it.
for (const f of sourceFiles().filter((f) => f.rel.endsWith(".tsx"))) {
  for (const chunk of f.text.split(/<section/).slice(1)) {
    if (!/bg-off-white/.test(chunk.slice(0, 400))) continue;
    checked++;
    const body = chunk.split(/<\/section>/)[0];
    // text-accent, but not text-accent-deep / text-accent-hover
    const bad = body.match(/text-accent(?!-)/g);
    if (bad) {
      failures.push(
        `${f.rel} — ${bad.length} use(s) of text-accent inside a bg-off-white section. ` +
          `That pair computes to ${ratio(token("accent"), token("off-white")).toFixed(2)}:1. ` +
          `Use text-accent-deep on light surfaces.`
      );
    }
  }
}

report("text contrast meets WCAG on every composited pair", failures, checked);
