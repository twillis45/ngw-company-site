// Gate: the entry point runs EVERY gate on disk.
//
// Spine Step 6b(ii). "Does verify:all exist" and "does verify:all run
// everything" are different questions, and the second one is the one that has
// actually bitten: an entry point chaining 16 of 20 suites satisfies the first
// question completely while four suites protect nothing.
//
// Assert the coverage. Do not eyeball it.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./lib.mjs";

const onDisk = readdirSync(join(ROOT, "scripts/gates"))
  .filter((f) => f.startsWith("verify-") && f.endsWith(".mjs"))
  .map((f) => f.replace(/^verify-|\.mjs$/g, ""))
  .filter((n) => n !== "coverage");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const entry = pkg.scripts?.["verify:all"] || "";
const reached = onDisk.filter((n) => entry.includes(`verify:${n}`));
const missed = onDisk.filter((n) => !reached.includes(n));

// A gate in verify:all but absent from CI is exercised by whoever remembers to
// run it locally, and never by the push that deploys. That is the same blind
// spot as an entry point missing a suite, one level up — so it is asserted, not
// assumed. Both jobs count: a gate may be split into its own job (the live
// origin one is), but it may not vanish.
let inCi = [];
let ciPresent = false;
try {
  const wf = readFileSync(join(ROOT, ".github/workflows/verify.yml"), "utf8");
  ciPresent = true;
  inCi = onDisk.filter((n) => wf.includes(`verify:${n}`));
} catch {
  /* no workflow — reported below, not silently treated as covered */
}
const ciMissed = ciPresent ? onDisk.filter((n) => !inCi.includes(n)) : onDisk;

console.log(`\ngates on disk:         ${onDisk.length}  (${onDisk.join(", ")})`);
console.log(`reached by verify:all: ${reached.length}`);
console.log(`reached by CI:         ${ciPresent ? inCi.length : "NO WORKFLOW"}`);

const failures = [];
if (missed.length) failures.push(`NEVER RUN AS PART OF THE SET: ${missed.join(", ")}`);
if (!ciPresent) {
  failures.push(
    "no .github/workflows/verify.yml — the gates run only when a person runs them, " +
      "and never on the commit that deploys"
  );
} else if (ciMissed.length) {
  failures.push(`IN verify:all BUT NOT IN CI: ${ciMissed.join(", ")}`);
}

if (failures.length) {
  console.log("");
  for (const f of failures) console.log(`FAIL  ${f}`);
  process.exit(1);
}
console.log(`\nPASS  every gate on disk is reachable from verify:all AND from CI`);
