// Gate: no colour the brand system bans reaches the shipped site.
//
// Studio Matte's light spec ends with a sentence that is a prohibition, not a
// preference: "No warm gold. No pink. No neon teal. No blue."
//
// The site was migrated off neon teal — tokens, components, every className —
// and shipped #2DD4BF anyway, in `icon.svg`: the favicon, referenced from every
// page, the most-repeated brand mark on the site. A re-score board found it and
// rejected the claim "zero neon teal" outright.
//
// The migration was thorough and the gate did not exist, so the one asset
// nobody thought of stayed wrong while everything else went right. That is the
// argument for a brand gate rather than a careful migration.

import { shippedFiles, sourceFiles, report, stripComments } from "./lib.mjs";

// Banned by name in the spec, with the values the site has actually used.
const BANNED = [
  [/#2DD4BF/i, "neon teal — banned by name in the Studio Matte light spec"],
  [/#14B8A6/i, "neon teal (hover) — same family, same prohibition"],
  [/#0F172A/i, "the old navy ground — not a Studio Matte token"],
  [/#0B1221/i, "the old navy — not a Studio Matte token"],
  [/\bfill="#(?!0B0B0C|121316|171A1F|E8E9EA|9DA2A8|858B91|849EB8|425C77|F4F6F8|FFFFFF|14171D)[0-9A-Fa-f]{6}"/,
   "a fill outside the Studio Matte palette"],
];

const failures = [];
let checked = 0;

// Source AND export. An SVG asset is copied to the export untouched, so a
// source-only check would miss a hand-edited one in public/, and an
// export-only check would miss it before the first build.
for (const f of [...sourceFiles(), ...shippedFiles()]) {
  if (/\.(map|lock)$/.test(f.rel)) continue;
  checked++;
  const text = stripComments(f.text);
  for (const [re, why] of BANNED) {
    const m = text.match(re);
    if (m) {
      const line = text.slice(0, m.index).split("\n").length;
      failures.push(`${f.rel}:${line} — ${JSON.stringify(m[0])}: ${why}`);
    }
  }
}

report("no banned colour reaches the shipped site", failures, checked);
