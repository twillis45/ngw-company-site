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

import { chromium } from "playwright";
import { report, requireExport, serveExport, shippedRoutes } from "./lib.mjs";

requireExport();

// The server and route list come from lib. They were written here first and
// then needed again by verify:contrast — and two copies of a helper are two
// chances for them to drift, which is the failure this repo has already
// recorded for an address and for a policy date.
const { server, base } = await serveExport();
const routes = shippedRoutes();


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
        // The measurement itself, reusable across interactive STATES. A gate
        // that only ever renders first paint measures the page nobody
        // interacts with: an audit found this one green while the open phone
        // menu carried 32px targets, because it never clicked the hamburger.
        const measure = (min) =>
          page.evaluate((min) => {
            const out = [];
            for (const el of document.querySelectorAll("button, a")) {
              const cs = getComputedStyle(el);
              // Inline links in prose are exempt (WCAG 2.5.8). Computed
              // display, not the class list — the class list is not the rule.
              if (el.tagName === "A" && cs.display === "inline") continue;
              if (cs.display === "none" || cs.visibility === "hidden") continue;
              // Visually-hidden elements are exempt, and this is a rule about
              // WHAT THE STANDARD GOVERNS rather than a convenience: 2.5.5 and
              // 2.5.8 size POINTER targets, and a clipped element is not
              // presented to a pointer at all — it is a keyboard affordance,
              // which is exactly what a skip link is. Detected by the clip
              // idiom, never by being small: a small element WITHOUT the clip
              // still fails, and a red-proof case holds that line.
              const clipped =
                /rect\(0px,\s*0px,\s*0px,\s*0px\)/.test(cs.clip) ||
                cs.clipPath === "inset(50%)";
              if (clipped) continue;
              const r = el.getBoundingClientRect();
              if (r.width === 0 && r.height === 0) continue;
              if (r.width < min || r.height < min)
                out.push(`${el.tagName.toLowerCase()}("${(el.textContent || "").trim().slice(0, 28)}") ${Math.round(r.width)}x${Math.round(r.height)}`);
            }
            return out;
          }, min);

        checked++;
        for (const s of await measure(MIN)) {
          failures.push(
            `${route} @phone [at rest] — control below ${MIN}x${MIN}: ${s}. WCAG 2.5.5; ` +
              `on a phone a target this small is missed, and hover does not exist to reveal it.`
          );
        }

        // STATE: the phone menu open. Its links were 32x32 and no gate saw them.
        const burger = await page.$('button[aria-label="Open menu"], button[aria-controls]');
        if (burger) {
          checked++;
          await burger.click();
          await page.waitForTimeout(250);
          const open = await page.evaluate(() => !!document.querySelector('[role="dialog"]'));
          if (!open) {
            failures.push(`${route} @phone — the hamburger opened nothing with role="dialog"; the menu state cannot be measured, so it is NOT passing`);
          } else {
            for (const s of await measure(MIN)) {
              failures.push(
                `${route} @phone [MENU OPEN] — control below ${MIN}x${MIN}: ${s}. ` +
                  `First paint is not the only state a phone user sees.`
              );
            }
          }
          await page.keyboard.press("Escape");
          await page.waitForTimeout(150);
        }

        // The skip link: WCAG 2.4.1 Level A. Assert it EXISTS, and that when
        // focused it becomes a real target rather than staying clipped.
        checked++;
        const skip = await page.evaluate((min) => {
          const a = document.querySelector('a[href^="#"]');
          if (!a) return { missing: true };
          a.focus();
          const r = a.getBoundingClientRect();
          return { missing: false, w: Math.round(r.width), h: Math.round(r.height), target: a.getAttribute("href") };
        }, MIN);
        if (skip.missing) {
          failures.push(`${route} — no skip link (a[href^="#"]). WCAG 2.4.1 Bypass Blocks, Level A: measured 6 Tab presses to reach main content before this existed.`);
        } else if (skip.h < MIN) {
          failures.push(`${route} — the skip link is still ${skip.w}x${skip.h} WHEN FOCUSED. A skip link that never becomes visible is one a sighted keyboard user cannot see they have.`);
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
