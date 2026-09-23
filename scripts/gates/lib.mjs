// Shared helpers for the gate suite.
//
// Two rules this file exists to enforce, both from the spine:
//   - A gate reads the artifact that SHIPS (out/), never only the source that
//     produced it. Source and export disagree the moment a build is stale.
//   - A gate ENUMERATES. Naming the one file a bug was found in produces a
//     check that can only ever confirm the fix it was written beside.

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

export const ROOT = new URL("../../", import.meta.url).pathname.replace(/\/$/, "");
export const OUT = join(ROOT, "out");
export const SRC = join(ROOT, "src");

export function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

/** Every shipped text file in the export, as {path, rel, text}. */
export function shippedFiles() {
  return walk(OUT)
    .filter((p) => /\.(html|js|txt|css|json|xml)$/.test(p))
    .map((p) => ({ path: p, rel: relative(ROOT, p), text: readFileSync(p, "utf8") }));
}

/** Every source file, same shape. */
export function sourceFiles() {
  return walk(SRC).map((p) => ({ path: p, rel: relative(ROOT, p), text: readFileSync(p, "utf8") }));
}

export function requireExport() {
  if (!existsSync(OUT)) {
    console.error("CANNOT CHECK — out/ does not exist. Run `npm run build` first.");
    console.error("This is not a pass. A gate with nothing to read has not run.");
    process.exit(2);
  }
}

export function report(name, failures, checked) {
  const n = failures.length;
  console.log(`\n${n === 0 ? "PASS" : "FAIL"}  ${name}  (${checked} checked, ${n} failing)`);
  for (const f of failures) console.log(`  ✗ ${f}`);
  process.exit(n === 0 ? 0 : 1);
}

/**
 * Strip comments so a gate analyzes CODE, not commentary.
 *
 * Written after verify:contact went red against a file that had already been
 * fixed: the replacement form has no fetch at all, but its comment explains
 * the bug it replaced — quoting `setSubmitted(true)` — and the gate matched
 * the explanation. A check that a comment can trip is a check a comment can
 * also silence, which is the worse direction.
 *
 * Only line comments at the start of a line (after whitespace) are removed, so
 * a `https://…` inside a string literal survives. That is deliberate: a
 * trailing `// note` is left in place rather than risk eating real code.
 */
export function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^[ \t]*\/\/.*$/gm, "");
}
