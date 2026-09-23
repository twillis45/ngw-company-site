// Gate: the site's only lead-capture path actually captures leads.
//
// Three independent failures produced one silent outage. Any ONE of them is
// enough to lose every inbound message, so all three are asserted:
//
//   1. The form posted to a dead endpoint — a relay ID never filled in, 404.
//   2. Its catch block entered the SUCCESS state.
//   3. And the one that actually fired: `await fetch()` RESOLVES on an HTTP
//      404; it rejects only on a network-layer failure. So the try block ran
//      on to the success call and the catch was never even reached. The
//      success state was UNCONDITIONAL — no input, no outage and no server
//      response could have made that form report a failure.
//
// (3) is why this gate asserts the response is inspected rather than merely
// that the catch is clean. A gate written against (2) alone goes green the
// moment someone deletes the catch, while every message is still discarded —
// a check pointed at the one place the invariant was not being broken.

import {
  shippedFiles,
  sourceFiles,
  requireExport,
  report,
  stripComments,
} from "./lib.mjs";

requireExport();

const failures = [];
let checked = 0;

// 1. No dead endpoint may ship. Read from the export: this is a property of
//    the artifact a visitor receives, not of the source that produced it.
const ENDPOINT = /https?:\/\/[^\s"'`)]+/g;
const DEAD = /\b(PLACEHOLDER|TODO|CHANGEME|YOUR_FORM_ID|xxx+)\b/i;

for (const f of shippedFiles()) {
  checked++;
  for (const url of f.text.match(ENDPOINT) || []) {
    if (DEAD.test(url)) failures.push(`${f.rel} — ships a dead endpoint: ${url}`);
  }
}

// 2 + 3. Submit handlers are inspected in SOURCE — the success/failure branch
//    is erased by minification, so the export genuinely cannot answer this.
//    Saying so beats a check that pretends to cover it.
//
//    Comments are stripped first. This gate went red against an already-fixed
//    file whose comment quoted the bug it replaced; a check a comment can trip
//    is a check a comment can also silence.
const SUCCESS_CALL = /set[A-Za-z]*(Submitted|Success|Sent)\s*\(\s*true\s*\)/;

for (const f of sourceFiles()) {
  const code = stripComments(f.text);
  if (!/\bfetch\s*\(/.test(code)) continue;
  if (!/onSubmit|handleSubmit|submit/i.test(code)) continue;
  checked++;

  for (const c of code.matchAll(/catch\s*(?:\([^)]*\))?\s*\{([\s\S]{0,400}?)\}/g)) {
    if (SUCCESS_CALL.test(c[1])) {
      const line = code.slice(0, c.index).split("\n").length;
      failures.push(`${f.rel}:${line} — catch block enters the SUCCESS state`);
    }
  }

  const inspectsResponse = /\.\s*(ok|status)\b/.test(code);
  if (SUCCESS_CALL.test(code) && !inspectsResponse) {
    failures.push(
      `${f.rel} — fetch result is never inspected (no .ok / .status check) yet ` +
        `the success state is entered: fetch RESOLVES on 4xx/5xx, so this ` +
        `reports "sent" for every failed send`
    );
  }
}

report("contact path cannot silently discard a message", failures, checked);
