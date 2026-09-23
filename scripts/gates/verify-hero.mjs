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
// something easier to satisfy, so this was stated rather than quietly changed:
// the looser rule still FAILED the home page at the moment it was written,
// because "Contact Us" (/contact) and "Email Us" (mailto:) were two different
// destinations. It changed what counted as a fix, not whether there was a
// defect. The home page was fixed in the same commit, so this comment then
// claimed a failure that no longer existed — an audit caught it. Corrected:
// the red-proof cases, not the prose, are what hold the line. Recorded NOT AUDITED in
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
    const form = t.match(/formaction="([^"]*)"/i);
    dests.add(href ? href[1] : form ? form[1] : "(form submit)");
  }

  // A destination alone is not the ask. Two buttons reading "Buy Now" and
  // "Book a Demo" are two heroes even when both submit a form, and "Buy the
  // $12k Retainer" beside "Get the Free Audit" are two heroes even when both
  // point at /contact. Normalised, so the same ask written with a trailing
  // arrow is still one ask.
  const asks = new Set();
  // matchAll, for the INDEX of each occurrence. A first version used
  // text.indexOf(tag), which returns the FIRST match every time — and two
  // identical tags are exactly the shape of this bypass, so both labels
  // resolved to the same string and the fix was INERT. It passed the very
  // probe it was written against, which is why the probe is run rather than
  // the fix being trusted.
  for (const m of f.text.matchAll(/<(?:a|button)\b[^>]*>/g)) {
    const cm = m[0].match(/class="([^"]*)"/);
    if (!cm) continue;
    if (!PRIMARY.every((tok) => cm[1].split(/\s+/).includes(tok))) continue;
    const seg = f.text.slice(m.index + m[0].length);
    const cut = seg.indexOf("<");
    const label = seg.slice(0, cut < 0 ? 80 : cut);
    const norm = label.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (norm) asks.add(norm);
  }
  if (asks.size > 1) {
    failures.push(
      `${f.rel} — ${asks.size} distinct primary ASKS [${[...asks].join(" | ")}] wear the ` +
        `hero treatment. Two different asks are two heroes even when they share a ` +
        `destination, and even when both merely submit a form.`
    );
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
