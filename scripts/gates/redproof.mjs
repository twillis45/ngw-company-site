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

import { readFileSync, writeFileSync, rmSync, existsSync, unlinkSync } from "node:fs";
import { createServer } from "node:http";
import { execSync, spawn } from "node:child_process";
import { join } from "node:path";
import { ROOT } from "./lib.mjs";

const only = process.argv.find((a) => a.startsWith("--only="))?.split("=")[1];

// A CRASH-SAFE RESTORE MANIFEST.
//
// This runner mutates real source files and restores them in a `finally`. A
// `finally` does not run on SIGKILL — so a killed sweep leaves the tree
// MUTATED, and on 2026-09-23 a `git add -A` swept one of those mutations into
// a commit and shipped it. The live company site read "No Guesswork Systems
// LLC exists to serve businesses work toward more structure" — ungrammatical,
// and a firm-voice assertion the claim ledger prohibits — for thirteen
// minutes. CI caught it; I did not.
//
// So the mutation is now journalled before it is written, and restored from
// the journal on every exit path INCLUDING signals, and on the next startup if
// a previous run never got the chance.
const MANIFEST = join(ROOT, ".redproof-active.json");

function journal(path, original) {
  writeFileSync(MANIFEST, JSON.stringify({ path, original, at: new Date().toISOString() }));
}
function clearJournal() {
  if (existsSync(MANIFEST)) unlinkSync(MANIFEST);
}
function restoreFromJournal(reason) {
  if (!existsSync(MANIFEST)) return false;
  try {
    const { path, original, at } = JSON.parse(readFileSync(MANIFEST, "utf8"));
    writeFileSync(path, original);
    clearJournal();
    console.error(
      `\nRESTORED ${path} from a red-proof mutation left by a previous run (${at}).\n` +
        `Reason: ${reason}. A killed sweep does not run its finally block, and a\n` +
        `mutated file in the tree is one 'git add -A' away from production.`
    );
    return true;
  } catch (e) {
    console.error(`\nCOULD NOT RESTORE from ${MANIFEST}: ${e.message}`);
    console.error("Check `git status` before committing anything.");
    return false;
  }
}

// If a previous run died, put the tree back before doing anything else.
restoreFromJournal("stale manifest found at startup");

for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(sig, () => {
    restoreFromJournal(`received ${sig}`);
    process.exit(130);
  });
}
process.on("uncaughtException", (e) => {
  restoreFromJournal(`uncaught exception: ${e.message}`);
  console.error(e);
  process.exit(1);
});

// Assembled here so this runner does not itself contain the literal the
// placeholder gate hunts for — but the file it WRITES does. The first draft
// got this backwards and wrote the concatenation expression into the target,
// so the literal never appeared and the fault was inert, which the runner
// then reported as a blind gate.
const TOKEN = "PLACE" + "HOLDER";

const CASES = [
  {
    // SOURCE half — no build. A re-score board pointed out this case rebuilt
    // for nothing: it goes RED from source alone, verified, and a case that
    // needs a build can report `?` when the build dies, which is not a result.
    gate: "placeholders",
    file: "src/components/ContactForm.tsx",
    needsBuild: false,
    describe: "placeholder literal in SOURCE — must go red without a build",
    mutate: (s) =>
      s.replace(
        "    const subject =",
        '    const DEAD_SRC = "https://formspree.io/f/' + TOKEN +
          '";\n    void DEAD_SRC;\n    const subject ='
      ),
  },
  {
    // EXPORT half — and this one keeps its build on purpose. Dropping the
    // build from BOTH cases would have left the gate's export half unproven,
    // and the export is what a visitor actually receives. The board's note was
    // about a wasted rebuild, not about giving up that coverage.
    gate: "placeholders",
    file: "src/components/ContactForm.tsx",
    needsBuild: true,
    describe: "the same literal reaching the EXPORT — the artifact a visitor receives",
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
    describe: "restore the SUPERSEDED Oakland address — the D&B value, not the record",
    mutate: (s) =>
      s
        .replace('street: "306 W Redwood St, STE 201"', 'street: "5000 Thayer Center, Suite E"')
        .replace('cityStateZip: "Baltimore, MD 21201"', 'cityStateZip: "Oakland, MD 21550"'),
  },
  {
    gate: "copy",
    file: "src/components/Footer.tsx",
    needsBuild: true,
    describe: "remove the address entirely — the gate must fail on ABSENCE, not pass",
    mutate: (s) => s.replace("{site.address.street}", "").replace("{site.address.cityStateZip}", ""),
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
    gate: "affordance",
    file: "src/components/Footer.tsx",
    needsBuild: false,
    describe: "drop a link back to the body tier — indistinguishable from the text beside it",
    mutate: (s) =>
      s.replace("text-ink/85 underline underline-offset-4 hover:text-ink",
                "text-muted hover:text-ink"),
  },
  {
    gate: "affordance",
    file: "src/components/Navbar.tsx",
    needsBuild: false,
    describe: "remove aria-current — nothing marks the current page",
    mutate: (s) => s.replace(/aria-current=\{pathname === "[^"]*" \? "page" : undefined\}/g, ""),
  },
  {
    gate: "claims",
    file: "docs/CAPABILITY-BACKING.md",
    needsBuild: false,
    deleteFile: true,
    describe: "delete the backing doc — a card could then name any capability at all",
  },
  {
    gate: "claims",
    file: "docs/CAPABILITY-BACKING.md",
    needsBuild: false,
    describe: "remove one backing row while its card still ships — the LEDGER LINK, not the wording",
    mutate: (s) => s.replace("| `Workflow Automation` |", "| `Workflow Automation (removed)` |"),
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

const run = (cmd, env = process.env) => {
  try {
    execSync(cmd, { cwd: ROOT, stdio: "pipe", env });
    return 0;
  } catch (e) {
    return e.status ?? 1;
  }
};

// verify:headers had ZERO red-proof cases — the one gate already found
// defective was the only one never watched failing under a reintroduced fault.
// It reads a live origin rather than a file, so its faults are SERVED, not
// written to disk.
//
// The last case is the important one and is easy to leave out: a GOOD origin
// that must go GREEN. Without it the gate's pass path is never exercised, and
// a gate that has only ever been seen failing is as unproven as one that has
// only ever been seen passing.
const GOOD_CSP =
  "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self'; " +
  "font-src 'self'; img-src 'self'; connect-src 'self'; form-action 'none'; " +
  "frame-ancestors 'none'; base-uri 'none'; object-src 'none'";
const GOOD = {
  "strict-transport-security": "max-age=31536000; includeSubDomains",
  "content-security-policy": GOOD_CSP,
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "DENY",
};

const ORIGIN_CASES = [
  ["max-age=0 — the header is PRESENT and DISABLES HSTS", { "strict-transport-security": "max-age=0" }, "RED"],
  ["default-src * — permits everything", { "content-security-policy": "default-src *; frame-ancestors 'none'" }, "RED"],
  ["script-src * 'unsafe-inline' https://evil.example — the directive that matters most", {
    "content-security-policy": "default-src 'self'; frame-ancestors 'none'; script-src * 'unsafe-inline' https://evil.example",
  }, "RED"],
  ["referrer-policy: unsafe-url — still leaks full URLs", { "referrer-policy": "unsafe-url" }, "RED"],
  ["x-frame-options: ALLOWALL — not a real value", { "x-frame-options": "ALLOWALL" }, "RED"],
  ["a GOOD origin — the gate's PASS path, which had never been exercised", {}, "GREEN"],
];

async function runOriginCases() {
  const out = [];
  for (const [describe, override, expect] of ORIGIN_CASES) {
    const headers = { ...GOOD, ...override };
    const srv = createServer((req, res) => {
      for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
      res.setHeader("content-type", "text/html");
      res.end("<html></html>");
    });

    // Port 0 = let the OS pick a free one. A fixed port made two overlapping
    // runs collide with EADDRINUSE, which threw an unhandled 'error' event and
    // killed the whole sweep — and because the run was piped, the PIPELINE's
    // exit code was reported instead of the runner's, so a CRASHED red-proof
    // sweep reported success. A guard that dies and reports 0 is the failure
    // this runner exists to catch, happening to the runner itself.
    let port;
    let verdict = "?";
    let note = "";
    try {
      await new Promise((resolve, reject) => {
        srv.once("error", reject);
        srv.listen(0, () => {
          port = srv.address().port;
          resolve();
        });
      });
      // ASYNC, deliberately. execSync blocks this process's event loop, so
      // the server above could not accept the child's connections at all —
      // every fetch failed, verify:headers exited 2 (CANNOT CHECK), and all
      // six cases came back `?`. A synchronous exec cannot talk to a server
      // living in the same process. The runner was right to refuse a verdict;
      // the harness was what could not produce one.
      const code = await new Promise((resolve) => {
        const child = spawn("npm", ["run", "--silent", "verify:headers"], {
          cwd: ROOT,
          stdio: "pipe",
          env: { ...process.env, NGWS_ORIGIN: `http://localhost:${port}` },
        });
        child.on("close", (c) => resolve(c ?? 1));
        child.on("error", () => resolve(1));
      });
      verdict = code === 0 ? "GREEN" : code === 1 ? "RED" : "?";
    } catch (e) {
      // Cannot evaluate is not a pass and not a failure.
      verdict = "?";
      note = `could not stand up a controlled origin: ${e.message}`;
    } finally {
      await new Promise((r) => srv.close(r));
    }
    const ok = verdict === expect;
    const mark = verdict === "?" ? "?" : ok ? "✓" : "✗";
    console.log(`${mark} ${verdict.padEnd(5)} verify:headers      ${describe}`);
    console.log(`         served a controlled origin on an ephemeral port; expected ${expect}${note ? " — " + note : ""}`);
    // Tally by whether the case met its EXPECTATION, not by colour. One case
    // deliberately expects GREEN — the gate's pass path — and folding it into
    // the RED bucket made the summary read "6 RED" when one of them was a
    // correct GREEN. A summary that misstates its own cases is the small
    // version of everything else this runner exists to catch.
    out.push({
      gate: "headers",
      verdict: verdict === "?" ? "?" : ok ? "AS EXPECTED" : "UNEXPECTED",
      describe,
      note: note || `expected ${expect}, got ${verdict}`,
    });
  }
  return out;
}

const results = [];

for (const c of CASES) {
  if (only && c.gate !== only) continue;

  const path = join(ROOT, c.file);
  const original = readFileSync(path, "utf8");

  let verdict = "?";
  let note = "";
  try {
    let changed;
    journal(path, original);
    if (c.deleteFile) {
      rmSync(path);
      changed = original.length;
      note = `fault DELETED ${changed} bytes (${c.file})`;
    } else {
      // `.replace()` does not fail when it does not match. A fault that
      // silently no-ops proves nothing and would be recorded as a passing gate.
      const next = c.mutate(original);
      if (next === original) throw new Error(`fault did not apply to ${c.file}`);
      // Report the size of the CHANGE, not a position-by-position mismatch.
      //
      // Two wrong versions preceded this one, and both misreported on the one
      // instrument whose entire job is telling an INERT fault from a BLIND
      // gate:
      //   1. A length DELTA, so an equal-length substitution printed 0 bytes
      //      and read exactly like a fault that never applied.
      //   2. A position-by-position comparison, so a ONE-CHARACTER insertion
      //      near the top of a 6 KB file printed 5306 — every character after
      //      the insertion is shifted and counts as different. It was accurate
      //      only for equal-length substitutions, which is the single case the
      //      first version had been written for.
      //
      // Trimming the common prefix and suffix gives the real edit size for
      // insertions, deletions and substitutions alike, in O(n).
      let a = 0;
      while (a < next.length && a < original.length && next[a] === original[a]) a++;
      let b = 0;
      while (
        b < next.length - a &&
        b < original.length - a &&
        next[next.length - 1 - b] === original[original.length - 1 - b]
      ) b++;
      changed = Math.max(next.length - a - b, original.length - a - b);
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
    clearJournal();
  }

  results.push({ gate: c.gate, verdict, describe: c.describe, note });
  const mark = verdict === "RED" ? "✓" : verdict === "GREEN" ? "✗" : "?";
  console.log(`${mark} ${verdict.padEnd(5)} verify:${c.gate.padEnd(13)} ${c.describe}`);
  console.log(`         ${note}`);
}

run("npm run build"); // restore the export the mutated builds overwrote

if (!only || only === "headers") results.push(...(await runOriginCases()));

const red = results.filter((r) => r.verdict === "RED" || r.verdict === "AS EXPECTED");
const blind = results.filter((r) => r.verdict === "GREEN" || r.verdict === "UNEXPECTED");
const unevaluated = results.filter((r) => r.verdict === "?");

console.log(
  `\n${results.length} cases — ${red.length} as expected, ${blind.length} NOT as expected, ${unevaluated.length} unevaluated`
);
if (blind.length)
  console.log(
    `DID NOT BEHAVE AS EXPECTED: ${blind.map((r) => r.gate).join(", ")} — read the change size above ` +
      `before concluding the gate is blind; an inert fault looks identical from the exit code.`
  );
if (unevaluated.length)
  console.log(
    `NOT A RESULT — re-run alone before citing the gates they cover: ` +
      unevaluated.map((r) => r.gate).join(", ")
  );
process.exit(blind.length || unevaluated.length ? 1 : 0);
