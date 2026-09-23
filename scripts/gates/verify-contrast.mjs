// Gate: text contrast is COMPUTED, never judged by eye.
//
// The defect this guards was real and invisible: the site's accent (#2DD4BF)
// is a fine colour on navy — 10.05:1 — and a hard WCAG 1.4.3 failure on the
// off-white section at 1.78:1, where it was used for an eyebrow label and five
// check glyphs. The same token, correct in one place and 2.5x under the bar in
// another. Nothing that looks at a palette can catch that; only compositing the
// pair can.
//
// Two assertions, because a ratio table alone is a check that cannot fail:
//
//   1. Every (foreground, surface) pair the design actually pairs is computed
//      against the WCAG threshold for its size.
//   2. The light-surface sections are grepped to prove the failing pair is not
//      reintroduced. A ratio table proves the tokens are capable of passing;
//      only this proves they are used that way.
//
//   3. Every text run that ACTUALLY RENDERS is composited in a real browser.
//      Added 2026-09-23 after an audit found the hole: assertions 1 and 2 read
//      a table of 17 token pairs, and the site ships ALPHA forms — text-ink/85,
//      text-ink/10 — which that table never composites. Every alpha variant
//      happened to pass, so the blind spot was harmless on the day it was
//      found; a future text-ink/40 would have sailed straight through. A gate
//      that is only accidentally correct is a gate that has not run.
//
//      The browser resolves the colour, not this file: Tailwind 4 emits
//      oklab(), and hand-parsing it here would be a second implementation of
//      the thing the browser already does exactly.
//
//      BUT NOT VIA fillStyle. The first version of this assertion read
//      `cv.fillStyle = css; return cv.fillStyle` — and Chrome hands the oklab
//      string straight back, unconverted. The parser then returned null, every
//      element hit `continue`, and the assertion examined ZERO elements while
//      reporting "24 checked", because it was counting ROUTES. It passed under
//      a paragraph rendered at 25% alpha. A check that cannot fail, written
//      inside the gate whose whole purpose is catching checks that cannot fail.
//
//      Two fixes, and the second matters more. Rasterise: fill a pixel and
//      read it back with getImageData, which forces sRGB. And NEVER `continue`
//      past a colour that will not parse — an unreadable colour is now a
//      FAILURE, because silently skipping is exactly how this went blind.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, sourceFiles, report, serveExport, shippedRoutes } from "./lib.mjs";
import { chromium } from "playwright";

const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = (h) => { const [r,g,b] = [1,3,5].map(i => parseInt(h.slice(i,i+2),16));
                     return 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b); };
const ratio = (a,b) => { const l1 = lum(a), l2 = lum(b);
                         return (Math.max(l1,l2)+0.05) / (Math.min(l1,l2)+0.05); };

// Read the tokens from the stylesheet rather than restating them here. A gate
// that carries its own copy of the value it checks is testing itself.
const css = readFileSync(join(ROOT, "src/app/globals.css"), "utf8");
const token = (name) => {
  const m = css.match(new RegExp("--color-" + name + ":\\s*(#[0-9A-Fa-f]{6})"));
  if (!m) {
    // Exit 2, not 1. A gate that cannot find its subject has not failed the
    // design — it has failed to run, and collapsing those into one exit code
    // is how a crash comes to read as a finding.
    console.error(`CANNOT CHECK — token --color-${name} is not declared in globals.css.`);
    console.error("This is not a contrast failure. Declare the token, then re-run.");
    process.exit(2);
  }
  return m[1].toUpperCase();
};

// Every pair the design actually composites, with the threshold for its use.
// 4.5 is normal text; 3.0 is large text (>=24px, or >=18.66px bold).
const PAIRS = [
  // Studio Matte, canonical dark. The spec's own claimed ratios are in the
  // comments; this gate recomputes them rather than trusting them.
  ["ink",          "carbon",     4.5, "primary text on the page (spec claims 16.18)"],
  ["muted",        "carbon",     4.5, "secondary prose (spec claims 7.65)"],
  ["faint",        "carbon",     4.5, "metadata and kickers (spec claims 5.71)"],
  ["steel",        "carbon",     4.5, "the one accent (spec claims 7.09)"],
  ["ink",          "surface",    4.5, "primary text on the first layer"],
  ["muted",        "surface",    4.5, "prose on the first layer"],
  ["ink",          "surface-2",  4.5, "primary text on the second layer"],
  ["muted",        "surface-2",  4.5, "prose on the second layer"],
  ["faint",        "surface-2",  4.5, "metadata on the second layer"],
  ["carbon",       "steel",      4.5, "button label on the accent fill"],
  // Light / print surfaces.
  ["ink-dark",     "paper",      4.5, "primary text on paper (spec claims 16.57)"],
  ["ink-support",  "paper",      4.5, "supporting text on paper (spec claims 6.54)"],
  ["ink-whisper",  "paper",      4.5, "evidence tier on paper (spec claims 4.97)"],
  ["steel-brand",  "paper",      4.5, "steel darkened for paper (spec claims 6.40)"],
  ["amber-ink",    "amber",      4.5, "text on an amber status pill (spec claims 6.23)"],
  ["alert",        "paper",      4.5, "at-risk (spec claims 5.19)"],
  ["confirm",      "paper",      4.5, "on-track (spec claims 4.65)"],
];

const failures = [];
let checked = 0;

for (const [fg, bg, min, why] of PAIRS) {
  checked++;
  const r = ratio(token(fg), token(bg));
  if (r < min) {
    failures.push(
      `${fg} (${token(fg)}) on ${bg} (${token(bg)}) = ${r.toFixed(2)}:1, needs ${min} — ${why}`
    );
  }
}

// 2. The failing pair must not come back. Scope every light-surface section and
//    assert the bright accent is not used for text inside it.
for (const f of sourceFiles().filter((f) => f.rel.endsWith(".tsx"))) {
  for (const chunk of f.text.split(/<section/).slice(1)) {
    if (!/bg-paper/.test(chunk.slice(0, 400))) continue;
    checked++;
    const body = chunk.split(/<\/section>/)[0];
    // text-accent, but not text-accent-deep / text-accent-hover
    const bad = body.match(/text-steel(?!-)/g);
    if (bad) {
      failures.push(
        `${f.rel} — ${bad.length} use(s) of text-steel inside a bg-paper section. ` +
          `That pair computes to ${ratio(token("steel"), token("paper")).toFixed(2)}:1. ` +
          `Use text-steel-brand on light surfaces.`
      );
    }
  }
}

// 3. Composite what actually renders.
{
  const { server, base } = await serveExport();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    for (const route of shippedRoutes()) {
      const r = await page.goto(base + route, { waitUntil: "networkidle" });
      if (!r || !r.ok()) {
        failures.push(`${route} — served HTTP ${r ? r.status() : "nothing"}; contrast could not be composited, which is NOT a pass`);
        continue;
      }
      const bad = await page.evaluate(() => {
        const cv = document.createElement("canvas").getContext("2d");
        // The browser parses any CSS colour, including oklab(), and returns
        // sRGB — so this file never reimplements a colour space.
        // Rasterise, do not read fillStyle back. Chrome returns oklab()
        // unchanged from fillStyle; painting a pixel forces sRGB.
        const parse = (css) => {
          cv.clearRect(0, 0, 1, 1);
          cv.fillStyle = "rgba(0,0,0,0)";
          cv.fillStyle = css;
          cv.fillRect(0, 0, 1, 1);
          const d = cv.getImageData(0, 0, 1, 1).data;
          if (d[3] === 0 && !/transparent|rgba?\([^)]*,\s*0\s*\)/.test(css)) return null;
          return [d[0], d[1], d[2], d[3] / 255];
        };
        const over = (fg, bg) => fg.slice(0,3).map((c,i) => c * fg[3] + bg[i] * (1 - fg[3]));
        const lin = (c) => { c /= 255; return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); };
        const lum = ([r,g,b]) => 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b);
        const ratio = (a,b) => { const l1=lum(a), l2=lum(b); return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05); };

        // The effective background: walk up until something is opaque,
        // compositing each translucent layer on the way.
        const bgOf = (el) => {
          let stack = [], n = el;
          while (n && n !== document.documentElement.parentNode) {
            const c = parse(getComputedStyle(n).backgroundColor);
            if (c && c[3] > 0) { stack.push(c); if (c[3] === 1) break; }
            n = n.parentElement;
          }
          let acc = [255,255,255];
          for (const layer of stack.reverse()) acc = over(layer, acc);
          return acc;
        };

        const out = [];
        let els = 0;
        for (const el of document.querySelectorAll("p,h1,h2,h3,h4,li,a,button,span,td,th,label,code,strong,em")) {
          // Only elements with their own visible text.
          const own = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join(" ");
          if (!own) continue;
          const cs = getComputedStyle(el);
          if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) === 0) continue;
          // WCAG 1.4.3 exempts INCIDENTAL text — "pure decoration". An element
          // the author has marked aria-hidden is removed from the
          // accessibility tree and conveys nothing, which is that exemption
          // exactly. This keys on the DECLARATION, never on being faint: a
          // faint element WITHOUT aria-hidden still fails, and a red-proof
          // case holds that line so the exemption cannot become a loophole.
          //
          // If an aria-hidden element were the only carrier of some
          // information, that is a worse bug than low contrast — and it is not
          // this gate's to catch.
          if (el.closest('[aria-hidden="true"]')) continue;
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;
          const fg = parse(cs.color);
          // NOT `continue`. Skipping an unparseable colour is how this
          // assertion silently emptied itself.
          if (!fg) { out.push(`UNREADABLE colour on <${el.tagName.toLowerCase()}> "${own.slice(0,30)}": ${cs.color} — the gate could not composite it, which is not a pass`); continue; }
          els++;
          const composited = over(fg, bgOf(el));
          const px = parseFloat(cs.fontSize);
          const bold = parseInt(cs.fontWeight, 10) >= 700;
          const large = px >= 24 || (px >= 18.66 && bold);
          const min = large ? 3 : 4.5;
          const got = ratio(composited, bgOf(el));
          if (got < min) {
            out.push(`<${el.tagName.toLowerCase()}> "${own.slice(0,34)}" ${got.toFixed(2)}:1 (needs ${min}, ${Math.round(px)}px${bold?" bold":""}) colour ${cs.color}`);
          }
        }
        // Placeholders are a PSEUDO-ELEMENT, so nothing above sees them: the
        // sweep looks for elements with their own text nodes and a
        // ::placeholder has none. They are also the classic low-contrast
        // offender, because "grey enough to look like a hint" and "grey enough
        // to be unreadable" are the same colour. Named as unmeasured by the
        // audit that found the oklab blindness; closed here rather than left.
        for (const el of document.querySelectorAll("input[placeholder], textarea[placeholder]")) {
          const cs = getComputedStyle(el);
          if (cs.display === "none" || cs.visibility === "hidden") continue;
          const ph = getComputedStyle(el, "::placeholder");
          const fg = parse(ph.color);
          if (!fg) { out.push(`UNREADABLE ::placeholder colour on #${el.id || el.name}: ${ph.color}`); continue; }
          els++;
          const bg = bgOf(el);
          const got = ratio(over(fg, bg), bg);
          // Placeholder text is body-size here; 4.5 is the 1.4.3 bar.
          if (got < 4.5) {
            out.push(`::placeholder on #${el.id || el.name || el.tagName.toLowerCase()} "${el.placeholder.slice(0,26)}" ${got.toFixed(2)}:1 (needs 4.5) colour ${ph.color}`);
          }
        }

        return { out, els };
      });
      // Count ELEMENTS, not routes. "24 checked" was 24 routes while zero
      // elements were examined, which is how an empty sweep looked healthy.
      checked += bad.els;
      if (bad.els === 0) {
        failures.push(`${route} — composited ZERO text elements. A sweep that examines nothing is not a pass.`);
      }
      for (const b of bad.out) {
        failures.push(`${route} — RENDERED text fails WCAG 1.4.3: ${b}. The token table cannot see this; only compositing what ships can.`);
      }
    }
    await page.close();
  } finally {
    await browser.close();
    server.close();
  }
}

report("text contrast meets WCAG on every composited pair", failures, checked);
