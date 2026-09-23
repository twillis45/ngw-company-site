// Gate: the LIVE origin sends the response headers a public business site owes,
// WITH VALUES THAT MEAN SOMETHING, on EVERY route it ships.
//
// This gate reads production, not the repo, because a header is a property of
// the server and no file in this tree can prove one.
//
// TWO defects found by a dispatched security review on 2026-09-23, both in the
// first version of this file, and both of the same family — a check that cannot
// fail in the way that matters:
//
//   1. It asserted PRESENCE, not VALUE. `strict-transport-security: max-age=0`
//      — which DISABLES HSTS — passed. So did `content-security-policy:
//      default-src *`, `referrer-policy: unsafe-url`, and
//      `x-frame-options: ALLOWALL`. The check standing behind the single
//      highest-consequence owner item would have gone green on a remediation
//      that was actively wrong.
//   2. It fetched `/` and nothing else. A rule scoped to a path pattern would
//      leave six of seven routes bare with the gate still green. The spine asks
//      for an ENUMERATING gate; that was a spot check wearing one's name.
//
// Exit 2 (CANNOT CHECK) when the network is unreachable. A gate that cannot
// reach its subject has not passed and has not failed.

import { readdirSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { OUT, walk, requireExport } from "./lib.mjs";

const ORIGIN = process.env.NGWS_ORIGIN || "https://noguessworksystems.com";

// Each check returns null when satisfied, or the reason it is not.
const REQUIRED = {
  "strict-transport-security": (v) => {
    if (!v) return "absent — a first request can be downgraded to http";
    const m = v.match(/max-age\s*=\s*(\d+)/i);
    if (!m) return `no max-age in ${JSON.stringify(v)}`;
    const age = Number(m[1]);
    // max-age=0 is not a weak policy, it is an INSTRUCTION TO FORGET one.
    if (age < 31536000) return `max-age=${age} is under one year (31536000)`;
    return null;
  },
  "content-security-policy": (v) => {
    if (!v) return "absent — any injected script executes with full privileges";
    if (/default-src[^;]*\*/.test(v)) return "default-src allows * — permits everything";
    if (!/default-src\s+'self'/.test(v)) return "no default-src 'self'";
    if (!/frame-ancestors\s+'none'/.test(v)) return "no frame-ancestors 'none'";
    if (/'unsafe-eval'/.test(v)) return "allows 'unsafe-eval'";
    // Measured 2026-09-23: zero <style> blocks and zero style= attributes ship,
    // and the Navbar's body.style.overflow write is NOT governed by style-src,
    // so this is genuinely unnecessary rather than merely undesirable.
    if (/style-src[^;]*'unsafe-inline'/.test(v)) return "style-src allows 'unsafe-inline', which nothing shipped needs";
    if (/img-src[^;]*data:/.test(v)) return "img-src allows data:, and zero data: URIs ship";
    return null;
  },
  "x-content-type-options": (v) =>
    v && /nosniff/i.test(v) ? null : "not nosniff — the browser may re-interpret a response's type",
  "referrer-policy": (v) => {
    if (!v) return "absent — full URLs leak to every third party linked";
    if (/unsafe-url|^no-referrer-when-downgrade$/i.test(v.trim())) return `${v} still leaks full URLs`;
    return null;
  },
  "x-frame-options": (v) => {
    if (!v) return "absent — the site can be embedded for clickjacking";
    return /^(DENY|SAMEORIGIN)$/i.test(v.trim()) ? null : `${v} is not DENY or SAMEORIGIN`;
  },
};

requireExport();

// Enumerate the routes from what actually SHIPS, so a new page cannot be added
// without this gate visiting it.
const routes = walk(OUT)
  .filter((p) => p.endsWith(".html"))
  .map((p) => relative(OUT, p).replace(/index\.html$/, "").replace(/\.html$/, ""))
  .filter((r) => !r.startsWith("_") && r !== "404")
  .map((r) => "/" + r.replace(/^\/+/, ""))
  .sort();
// Plus one static asset: a rule scoped to documents leaves assets bare.
const asset = walk(OUT).find((p) => p.endsWith(".css"));
const targets = [...new Set(routes)].concat(asset ? ["/" + relative(OUT, asset)] : []);

if (targets.length < 2) {
  console.error(`CANNOT CHECK — only ${targets.length} target(s) derived from out/. Build first.`);
  process.exit(2);
}

const failures = [];
let checked = 0;

for (const path of targets) {
  let res;
  try {
    res = await fetch(`${ORIGIN}${path}?cachebust=${Date.now()}`, { redirect: "follow" });
  } catch (e) {
    console.error(`CANNOT CHECK — ${ORIGIN}${path} unreachable: ${e.message}`);
    console.error("Not a pass. Re-run where the origin is reachable.");
    process.exit(2);
  }
  if (!res.ok) {
    console.error(`CANNOT CHECK — ${ORIGIN}${path} returned HTTP ${res.status}`);
    process.exit(2);
  }
  for (const [h, verdict] of Object.entries(REQUIRED)) {
    checked++;
    const why = verdict(res.headers.get(h));
    if (why) failures.push(`${path}  ${h}: ${why}`);
  }
}

const n = failures.length;
console.log(
  `\n${n === 0 ? "PASS" : "FAIL"}  security headers on ${ORIGIN}` +
    `  (${targets.length} targets x ${Object.keys(REQUIRED).length} headers = ${checked} assertions, ${n} failing)`
);
console.log(`  targets: ${targets.join("  ")}`);
for (const f of failures) console.log(`  ✗ ${f}`);
process.exit(n === 0 ? 0 : 1);
