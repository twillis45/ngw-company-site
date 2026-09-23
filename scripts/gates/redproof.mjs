// Red-proof: reintroduce each fault, watch the gate go RED, restore.
//
// A gate that has only ever been observed passing is a claim, not a check.
// Every gate here guards a fault that was real in production on 2026-09-23;
// this runner puts each one back and asserts the gate notices.
//
// Three outcomes, deliberately three rather than two:
//
//   RED   the gate failed under the fault. The gate works.
//   GREEN the gate passed under the fault. Two hypotheses, not one — the gate
//         is blind, OR the fault was inert. Both have happened here, and only
//         reading the reported numbers tells them apart.
//   ?     the case could not be evaluated. Not a pass and not a failure. The
//         absence of a signal is not the presence of the opposite one.
//
// Each fault prints WHAT IT CHANGED, in bytes, so an inert fault is visible as
// an inert fault rather than misread as a blind gate.

import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { ROOT } from "./lib.mjs";

const only = process.argv.find((a) => a.startsWith("--only="))?.split("=")[1];

// Assembled here so this runner does not itself contain the literal the
// placeholder gate hunts for — but the file it WRITES does. The first draft
// got this backwards and wrote the concatenation expression into the target,
// so the literal never appeared and the fault was inert, which the runner
// then reported as a blind gate.
const TOKEN = "PLACE" + "HOLDER";

const CASES = [
  {
    gate: "placeholders",
    file: "src/components/ContactForm.tsx",
    needsBuild: true,
    describe: "put a real placeholder-endpoint literal back into the form",
    mutate: (s) =>
      s.replace(
        "    const subject =",
        '    const DEAD_ENDPOINT = "https://formspree.io/f/' +
          TOKEN +
          '";\n    void DEAD_ENDPOINT;\n    const subject ='
      ),
  },
  {
    gate: "contact",
    file: "src/components/ContactForm.tsx",
    needsBuild: false,
    describe: "restore a fetch whose response is never inspected, entering success anyway",
    mutate: (s) =>
      s.replace(
        "    setHandedOff(true);",
        "    try {\n      await fetch('https://example.invalid/submit', { method: 'POST' });\n" +
          "      setSubmitted(true);\n    } catch { setSubmitted(true); }\n    setHandedOff(true);"
      ),
  },
  {
    gate: "copy",
    file: "src/site.ts",
    needsBuild: true,
    describe: "hardcode the copyright year back to 2025",
    mutate: (s) => s.replace("return new Date().getFullYear();", "return 2025;"),
  },
  {
    gate: "copy",
    file: "src/components/Footer.tsx",
    needsBuild: true,
    describe: "remove the copyright line — the gate must not pass on ABSENCE",
    mutate: (s) =>
      s.replace("© {site.year} {site.legalName}. All rights reserved.", "All rights reserved."),
  },
  {
    gate: "coverage",
    file: ".github/workflows/verify.yml",
    needsBuild: false,
    deleteFile: true,
    describe: "delete the CI workflow — the gates would run only when a person remembers",
  },
  {
    gate: "coverage",
    file: ".github/workflows/verify.yml",
    needsBuild: false,
    describe: "drop one gate from CI while leaving it in verify:all",
    mutate: (s) => s.replace("      - run: npm run verify:contrast\n", ""),
  },
  {
    gate: "assets",
    file: "src/app/icon.svg",
    needsBuild: true,
    deleteFile: true,
    describe: "delete the site icon — nothing exported, no <link rel=icon> on any page",
  },
  {
    gate: "claims",
    file: "src/app/page.tsx",
    needsBuild: true,
    describe: "restore an asserted OUTCOME with nothing measured behind it",
    mutate: (s) =>
      s.replace('"Every claim carries where it came from",',
                '"More consistent execution across teams",'),
  },
  {
    gate: "claims",
    file: "src/app/page.tsx",
    needsBuild: true,
    describe: "restore the firm-voice sentence the claim ledger prohibits",
    mutate: (s) =>
      s.replace("Each system targets one specific act of guessing",
                "We help organizations address inconsistent workflows and unclear"),
  },
  {
    gate: "claims",
    file: "src/app/page.tsx",
    needsBuild: true,
    describe: "DELETE the honest anchor — the gate must go red on ABSENCE, not pass",
    mutate: (s) => s.replace("was created to help", "exists to serve"),
  },
  {
    gate: "contrast",
    file: "src/app/page.tsx",
    needsBuild: false,
    describe: "put the bright accent back on the light section (1.78:1)",
    mutate: (s) =>
      s.replace('tracking-[0.08em] text-ink-support"', 'tracking-[0.08em] text-steel"'),
  },
  {
    gate: "assets",
    file: "src/app/robots.ts",
    needsBuild: true,
    deleteFile: true,
    describe: "delete the robots route — no robots.txt exported",
  },
];

const run = (cmd) => {
  try {
    execSync(cmd, { cwd: ROOT, stdio: "pipe", env: process.env });
    return 0;
  } catch (e) {
    return e.status ?? 1;
  }
};

const results = [];

for (const c of CASES) {
  if (only && c.gate !== only) continue;

  const path = join(ROOT, c.file);
  const original = readFileSync(path, "utf8");

  let verdict = "?";
  let note = "";
  try {
    let changed;
    if (c.deleteFile) {
      rmSync(path);
      changed = original.length;
      note = `fault DELETED ${changed} bytes (${c.file})`;
    } else {
      // `.replace()` does not fail when it does not match. A fault that
      // silently no-ops proves nothing and would be recorded as a passing gate.
      const next = c.mutate(original);
      if (next === original) throw new Error(`fault did not apply to ${c.file}`);
      // Count DIFFERING characters, not the length delta. A same-length
      // substitution — "Every claim carries where it came from" for "More
      // consistent execution across teams", both 37 characters — reported
      // "0 bytes" and read exactly like an inert fault, on the one instrument
      // whose job is to tell an inert fault from a blind gate.
      let diff = 0;
      for (let i = 0; i < Math.max(next.length, original.length); i++) {
        if (next[i] !== original[i]) diff++;
      }
      changed = diff;
      writeFileSync(path, next);
      note = `fault changed ${changed} chars in ${c.file} (length ${original.length} -> ${next.length})`;
    }

    if (c.needsBuild && run("npm run build") !== 0) {
      verdict = "?";
      note += " — build failed under the fault, the gate never ran";
    } else {
      verdict = run(`npm run verify:${c.gate}`) !== 0 ? "RED" : "GREEN";
    }
  } catch (e) {
    verdict = "?";
    note = e.message;
  } finally {
    writeFileSync(path, original);
  }

  results.push({ gate: c.gate, verdict, describe: c.describe, note });
  const mark = verdict === "RED" ? "✓" : verdict === "GREEN" ? "✗" : "?";
  console.log(`${mark} ${verdict.padEnd(5)} verify:${c.gate.padEnd(13)} ${c.describe}`);
  console.log(`         ${note}`);
}

run("npm run build"); // restore the export the mutated builds overwrote

const red = results.filter((r) => r.verdict === "RED");
const blind = results.filter((r) => r.verdict === "GREEN");
const unevaluated = results.filter((r) => r.verdict === "?");

console.log(
  `\n${results.length} cases — ${red.length} RED, ${blind.length} GREEN, ${unevaluated.length} unevaluated`
);
if (blind.length)
  console.log(
    `GREEN UNDER FAULT: ${blind.map((r) => r.gate).join(", ")} — read the byte count above ` +
      `before concluding the gate is blind; an inert fault looks identical from the exit code.`
  );
if (unevaluated.length)
  console.log(
    `NOT A RESULT — re-run alone before citing the gates they cover: ` +
      unevaluated.map((r) => r.gate).join(", ")
  );
process.exit(blind.length || unevaluated.length ? 1 : 0);
