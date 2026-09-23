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

console.log(`\ngates on disk:       ${onDisk.length}  (${onDisk.join(", ")})`);
console.log(`reached by verify:all: ${reached.length}`);
if (missed.length) {
  console.log(`\nFAIL  NEVER RUN AS PART OF THE SET: ${missed.join(", ")}`);
  process.exit(1);
}
console.log(`\nPASS  every gate on disk is reachable from verify:all`);
