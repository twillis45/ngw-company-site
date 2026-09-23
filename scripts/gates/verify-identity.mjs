// Clause (b) of the portfolio gate: "who is behind it".
//
// The board scored it RED — the site named no human being anywhere, and a
// referral-checker naming a faceless site as a rule-out is a PORTFOLIO
// failure, not a conversion one. This gate is what keeps it from silently
// going back.
//
// Two design rules, both earned in this repo THIS session:
//
// 1. SCRIPT AND STYLE BLOCKS ARE REMOVED BEFORE TAGS ARE STRIPPED. A naive
//    tag strip turns JSON-LD into "body text", so a name shipping ONLY in
//    structured data would satisfy a visible-text assertion. That is the same
//    shape as the defect that let the firm voice ship in <meta> for hours:
//    the gate read text content, and the thing it needed to see had none.
//
// 2. THE EXPECTED VALUES ARE DERIVED FROM src/site.ts, never restated here.
//    A gate that carries its own copy of the name goes green while the site
//    drifts. If the derivation fails, this exits 2 — cannot-check is not a
//    pass.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { visibleText, shippedFiles, report, requireExport, ROOT } from "./lib.mjs";

requireExport();

const siteSrc = readFileSync(join(ROOT, "src/site.ts"), "utf8");
const m = siteSrc.match(/principal:\s*\{\s*name:\s*"([^"]+)",\s*role:\s*"([^"]+)"/);
if (!m) {
  console.error("CANNOT CHECK — no principal {name, role} found in src/site.ts.");
  console.error("This is not a pass. The gate derives the expected values from it.");
  process.exit(2);
}
const [, NAME, ROLE] = m;

const failures = [];
let checked = 0;

const home = shippedFiles().find((f) => f.rel === "out/index.html");
if (!home) {
  console.error("CANNOT CHECK — out/index.html not found.");
  process.exit(2);
}

// Visible text only: script/style removed FIRST, then tags.
const visible = visibleText(home.text);

checked++;
if (!visible.includes(NAME)) {
  failures.push(
    `out/index.html — "${NAME}" does not appear in VISIBLE text. A checker ` +
      `reads the page, not the structured data. (If the name is present only ` +
      `in JSON-LD, that is the defect this assertion exists to catch.)`
  );
}

checked++;
if (!visible.includes(ROLE)) {
  failures.push(
    `out/index.html — the role "${ROLE}" does not appear in visible text. ` +
      `A name with no role names a person, not an accountable party.`
  );
}

// The fault that matters: markup and machine-readable record disagreeing.
checked++;
const ld = home.text.match(
  /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i
);
if (!ld) {
  failures.push("out/index.html — no application/ld+json block ships at all.");
} else {
  let parsed;
  try {
    parsed = JSON.parse(ld[1]);
  } catch (e) {
    failures.push(`out/index.html — JSON-LD does not parse: ${e.message}`);
  }
  if (parsed) {
    checked++;
    const founder = parsed.founder?.name;
    if (founder !== NAME) {
      failures.push(
        `out/index.html — JSON-LD founder.name is ${JSON.stringify(founder)} ` +
          `but the site names "${NAME}". A page whose markup and structured ` +
          `data disagree about who runs the company is worse than one that ` +
          `names nobody — it is checkable, and it fails the check.`
      );
    }
  }
}

// Recorded, not forgotten: the owner ruled 2026-09-23 for a name and role
// without a photograph. No portrait assertion exists because no portrait
// ships, which is a decision. If a portrait is ever added, it needs its own
// assertion here (resolves, non-empty alt) or it ships unchecked.

report("the site names who is behind it, and says so consistently", failures, checked);
