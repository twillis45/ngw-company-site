// The geometry half of the measurement pass, which lived in a transcript.
//
// The spine's stage-4 gate: "a measurement pass on any surface that renders in
// more than one layout regime — assert computed geometry in a real browser; do
// not eyeball it." verify:contrast closed the colour half months of sessions
// ago. The geometry half — tap targets and phone-width overflow — was measured
// in a real browser ONCE and the numbers went into a conversation, so nothing
// re-ran them. A measurement that cannot re-run is a memory, not a guard.
//
// It serves the EXPORT, not the dev server: the gate reads what ships.
//
// Two rules the assertions follow:
//
// 1. TAP TARGETS ARE SCOPED TO CONTROLS, NOT TO EVERY LINK. WCAG 2.5.5 wants
//    44x44 for pointer targets, and 2.5.8 exempts links inline in a sentence —
//    a gate that failed every prose link would be noise nobody reads, and a
//    noisy gate gets disabled. So: every <button>, and every <a> whose COMPUTED
//    display is not inline. Computed, because the class list is not the rule.
//
// 2. OVERFLOW IS ASSERTED ON THE DOCUMENT, AT THREE WIDTHS. The failure this
//    catches is one element wider than the screen, which looks fine at desktop
//    and pushes the whole page sideways on a phone.

import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { createServer } from "node:http";
import { chromium } from "playwright";
import { OUT, ROOT, report, requireExport, walk } from "./lib.mjs";

requireExport();

const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".png": "image/png",
  ".woff2": "font/woff2", ".json": "application/json", ".txt": "text/plain", ".xml": "application/xml" };

const server = createServer((req, res) => {
  const p = decodeURIComponent(req.url.split("?")[0]);
  // A directory passes existsSync but is not a file, and readFileSync throws
  // EISDIR rather than 404 — so resolve to a real FILE before serving.
  const isFile = (x) => existsSync(x) && statSync(x).isFile();
  let f = null;
  for (const cand of [join(OUT, p), join(OUT, p + ".html"), join(OUT, p, "index.html")]) {
    if (isFile(cand)) { f = cand; break; }
  }
  if (!f) { res.writeHead(404); return res.end("not found"); }
  res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" });
  res.end(readFileSync(f));
});

// Ephemeral port. A fixed port made an earlier runner die EADDRINUSE and, worse,
// report exit 0 through a pipe — so a crashed gate read as a passing one.
await new Promise((ok, bad) => { server.once("error", bad); server.listen(0, ok); });
const base = `http://127.0.0.1:${server.address().port}`;

const routes = walk(OUT)
  .filter((p) => p.endsWith(".html"))
  .map((p) => "/" + p.slice(OUT.length + 1).replace(/index\.html$/, "").replace(/\.html$/, ""))
  .filter((r) => !r.includes("_not-found"));

const WIDTHS = [[375, 812, "phone"], [768, 1024, "tablet"], [1280, 900, "desktop"]];
const MIN = 44;

const failures = [];
let checked = 0;
const browser = await chromium.launch();

try {
  for (const [w, h, label] of WIDTHS) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    for (const route of routes) {
      const resp = await page.goto(base + route, { waitUntil: "networkidle" });
      if (!resp || !resp.ok()) {
        failures.push(`${route} @${label} — served HTTP ${resp ? resp.status() : "nothing"}; the gate could not measure it`);
        continue;
      }

      checked++;
      const over = await page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (over > 0) {
        const culprit = await page.evaluate((vw) => {
          for (const el of document.querySelectorAll("*")) {
            const r = el.getBoundingClientRect();
            if (r.right > vw + 1 || r.left < -1)
              return `<${el.tagName.toLowerCase()} class="${(el.className || "").toString().slice(0, 70)}"> right=${Math.round(r.right)}`;
          }
          return "(no single element exceeds the viewport — likely a margin or a min-width)";
        }, w);
        failures.push(`${route} @${label} ${w}px — document scrolls ${over}px sideways. First offender: ${culprit}`);
      }

      if (label === "phone") {
        checked++;
        const small = await page.evaluate((min) => {
          const out = [];
          for (const el of document.querySelectorAll("button, a")) {
            const cs = getComputedStyle(el);
            // Inline links in prose are exempt (WCAG 2.5.8). Computed display,
            // not the class list — the class list is not the rule.
            if (el.tagName === "A" && cs.display === "inline") continue;
            if (cs.display === "none" || cs.visibility === "hidden") continue;
            const r = el.getBoundingClientRect();
            if (r.width === 0 && r.height === 0) continue;
            if (r.width < min || r.height < min)
              out.push(`${el.tagName.toLowerCase()}("${(el.textContent || "").trim().slice(0, 28)}") ${Math.round(r.width)}x${Math.round(r.height)}`);
          }
          return out;
        }, MIN);
        for (const s of small) {
          failures.push(
            `${route} @phone — control below ${MIN}x${MIN}: ${s}. WCAG 2.5.5; on a phone ` +
              `a target this small is missed, and hover does not exist to reveal it.`
          );
        }
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}

report(`computed geometry holds at ${WIDTHS.length} widths`, failures, checked);
