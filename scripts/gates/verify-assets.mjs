// Gate: the files every public site is expected to serve are actually exported,
// AND are actually referenced by the pages that need them.
//
// Each of these returned 404 on production when this gate was written.
//
// The icon check asserts the invariant rather than a filename. A first draft
// demanded `out/favicon.ico` specifically, which would have gone red against a
// perfectly good `icon.svg` and green against a favicon.ico that no page
// links to. What matters is that a browser can find an icon — so this asserts
// an icon file exists and every page's <head> points at one.

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { OUT, shippedFiles, requireExport, report } from "./lib.mjs";

requireExport();

const failures = [];
let checked = 0;

// 1. Files a crawler expects at fixed paths.
for (const [file, why] of [
  ["robots.txt", "crawlers have no instructions; nothing states what is indexable"],
  ["sitemap.xml", "no sitemap — every page must be discovered by crawl alone"],
  ["404.html", "no not-found page"],
]) {
  checked++;
  if (!existsSync(join(OUT, file))) failures.push(`out/${file} missing — ${why}`);
}

// 2. An icon exists under any name the platform accepts.
checked++;
const icons = readdirSync(OUT).filter((f) => /^(favicon\.ico|icon\.(svg|png|ico))$/.test(f));
if (icons.length === 0) {
  failures.push("no icon exported — the tab and every bookmark render blank");
}

// 3. Every shipped page actually references one.
for (const f of shippedFiles().filter((f) => f.rel.endsWith(".html"))) {
  checked++;
  if (!/<link[^>]+rel="[^"]*icon[^"]*"/i.test(f.text)) {
    failures.push(`${f.rel} — no <link rel="icon"> in <head>`);
  }
}

// 4. The 404 must be the site's own page, not the framework's white default.
checked++;
const notFound = shippedFiles().find((f) => f.rel.endsWith("out/404.html"));
if (notFound && /background:#fff/.test(notFound.text) && !/bg-navy/.test(notFound.text)) {
  failures.push("out/404.html is the framework's unstyled default, not the site's 404");
}

report("required public assets are exported and referenced", failures, checked);
