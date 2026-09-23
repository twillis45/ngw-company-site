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
    .replace(/^[ \t]*\/\/.*$/gm, "")
    // YAML comments too. verify:coverage reads a workflow file, and a comment
    // there satisfied it for a whole session — a board deleted the job that
    // ran a gate, left the comment naming it, and the gate stayed green.
    .replace(/^[ \t]*#.*$/gm, "")
    // HTML/XML/SVG comments. verify:brand reads .svg, and the very comment
    // explaining WHY a colour is banned contains that colour — so the gate
    // failed on its own documentation.
    //
    // This is the FOURTH time a comment has tripped or could have silenced a
    // gate here: verify:contact matched a comment quoting the bug it replaced;
    // an assertion matched a comment naming the cards it removed;
    // verify:coverage was satisfied by a YAML comment; and now this. The rule
    // is one line and it has earned repeating — a gate analyzes CODE, and a
    // check a comment can trip is a check a comment can also silence.
    .replace(/<!--[\s\S]*?-->/g, "");
}

/**
 * The text a READER sees: script and style blocks removed BEFORE tags.
 *
 * Twice in one session a gate meant to check visible copy was satisfied by
 * markup no reader sees. First the firm voice shipped in <meta description>
 * for hours, because verify:claims stripped tags to get text and a meta tag
 * has no text content. Then — an hour after that was fixed — an Organization
 * JSON-LD block was added carrying streetAddress on every page, and a
 * red-proof that stripped the address out of the FOOTER went green, because
 * verify:copy searched raw HTML and found it in the structured data.
 *
 * Measured under that second fault: a naive /<[^>]+>/ strip finds the value
 * (the JSON-LD becomes body text); this does not. Same shape, two gates, so
 * it lives here once rather than being re-derived a third time.
 *
 * Structured data still deserves its own assertions — see verify:identity,
 * which checks that JSON-LD AGREES with the visible text. What it must never
 * do is stand in for the visible text.
 */
export function visibleText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
}

/**
 * Serve the EXPORT on an ephemeral port, for gates that need a real browser.
 *
 * One copy, because two gates need it now and two copies of a helper are two
 * chances for them to drift. Three things it gets right, each earned:
 *   - A directory passes existsSync but is not a file, and readFileSync throws
 *     EISDIR rather than serving a 404.
 *   - An ephemeral port: a fixed one made an earlier runner die EADDRINUSE and
 *     report exit 0 through a pipe, so a crashed gate read as a passing one.
 *   - It serves out/, never the dev server — a gate reads what SHIPS.
 */
export async function serveExport() {
  const { createServer } = await import("node:http");
  const { extname } = await import("node:path");
  const TYPES = { ".html":"text/html", ".css":"text/css", ".js":"text/javascript",
    ".svg":"image/svg+xml", ".ico":"image/x-icon", ".png":"image/png",
    ".woff2":"font/woff2", ".json":"application/json", ".txt":"text/plain", ".xml":"application/xml" };
  const isFile = (x) => existsSync(x) && statSync(x).isFile();
  const server = createServer((req, res) => {
    const p = decodeURIComponent(req.url.split("?")[0]);
    let f = null;
    for (const cand of [join(OUT, p), join(OUT, p + ".html"), join(OUT, p, "index.html")]) {
      if (isFile(cand)) { f = cand; break; }
    }
    if (!f) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" });
    res.end(readFileSync(f));
  });
  await new Promise((ok, bad) => { server.once("error", bad); server.listen(0, ok); });
  return { server, base: `http://127.0.0.1:${server.address().port}` };
}

/** Every shipped route, as paths, minus the internal not-found. */
export function shippedRoutes() {
  return walk(OUT)
    .filter((p) => p.endsWith(".html"))
    .map((p) => "/" + p.slice(OUT.length + 1).replace(/index\.html$/, "").replace(/\.html$/, ""))
    .filter((r) => !r.includes("_not-found"));
}
