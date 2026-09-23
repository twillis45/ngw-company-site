// The Attention System's "one hero" clause: a route that offers two equally
// weighted primary actions has offered none.
//
// COUNTS DESTINATIONS, NOT ELEMENTS. The first draft asserted "exactly one
// element carrying the primary class per route" and failed the home page for
// repeating its single call to action at the top and the bottom — which is
// ordinary practice on a long page, not a second hero. The clause is about
// COMPETING ACTIONS. One action offered twice is still one action; two
// actions offered once each is two heroes, which is none.
//
// Loosening a criterion to fit the code is how a gate gets paraphrased into
// something easier to satisfy, so this is stated rather than quietly changed:
// the looser rule STILL FAILS the home page as it stands today, because
// "Contact Us" (/contact) and "Email Us" (mailto:) are two different
// destinations. It changes what counts as a fix, not whether there is a
// defect. A red-proof case holds the line. Recorded NOT AUDITED in
// docs/research/2026-09-23-activation-doctrine-scan.md and left unmeasured.
//
// The signature is DERIVED from Button.tsx, never hard-copied here. A gate
// that restates the primary class beside the component goes green while the
// component drifts — the exact failure `measure-dont-look` rule 6 names. If
// the derivation finds nothing, this exits 2: a gate that cannot locate the
// thing it checks has not run, and must not report PASS.

import { shippedFiles, sourceFiles, report, requireExport, stripComments } from "./lib.mjs";

requireExport();

const failures = [];
let checked = 0;

const button = sourceFiles().find((f) => f.rel.endsWith("components/Button.tsx"));
if (!button) {
  console.error("CANNOT CHECK — components/Button.tsx not found.");
  console.error("This is not a pass. The primary signature is derived from it.");
  process.exit(2);
}

const m = stripComments(button.text).match(/primary:\s*"([^"]+)"/);
if (!m) {
  console.error("CANNOT CHECK — no `primary: \"...\"` variant found in Button.tsx.");
  console.error("This is not a pass. The gate reads the component, not a copy of it.");
  process.exit(2);
}

// Every token must be present on the element, so a secondary button that
// happens to share one utility class is not miscounted as a hero.
const PRIMARY = m[1].trim().split(/\s+/);

for (const f of shippedFiles().filter((f) => f.rel.endsWith(".html"))) {
  checked++;
  // Tags, not bare class attributes, so the destination travels with the
  // class. <button> counts too: the contact page's hero is its form submit,
  // and an <a>-only match reported that page as having NO primary action at
  // all — a gate that stops seeing a real hero is worse than none.
  const tags = f.text.match(/<(?:a|button)\b[^>]*>/g) || [];
  const dests = new Set();
  for (const t of tags) {
    const cm = t.match(/class="([^"]*)"/);
    if (!cm) continue;
    const cls = cm[1].split(/\s+/);
    if (!PRIMARY.every((tok) => cls.includes(tok))) continue;
    const href = t.match(/href="([^"]*)"/);
    dests.add(href ? href[1] : "(form submit)");
  }

  if (dests.size !== 1) {
    failures.push(
      `${f.rel} — ${dests.size} distinct primary destination(s) ` +
        (dests.size ? `[${[...dests].join(", ")}] ` : "") +
        `carry the hero treatment (${PRIMARY.join(" ")}); the one-hero clause ` +
        `requires exactly 1. ` +
        (dests.size === 0
          ? "A route with no primary action offers the reader nothing to do."
          : "Two competing actions are two heroes, which is none.")
    );
  }
}

report(`exactly one hero action per shipped route`, failures, checked);
