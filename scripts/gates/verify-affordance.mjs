// Gate: a link must not be indistinguishable from the text around it.
//
// Measured on the live site before this gate existed: NINE of twelve links
// computed to rgb(157,162,168) — byte-identical to `body` — with
// `text-decoration: none` and weight 400. The footer's email address sat
// directly above the postal address in the same colour with nothing marking it
// clickable.
//
// Hover fixed it, and hover does not exist on a phone. That is the whole
// finding: the affordance was real only on the device that needed it least.
//
// Two assertions:
//   1. No anchor rests on the BODY tier (`text-muted`) without an underline.
//      The design system's own mechanism is three contrast tiers, so a link at
//      the same tier as body prose is not distinguishable by design — it is
//      distinguishable by accident, or not at all.
//   2. The nav marks the current page. Without `aria-current` a screen-reader
//      user has no way to know where they are, and neither does anyone else,
//      since every nav item computed identically.

import { sourceFiles, report, stripComments } from "./lib.mjs";

// The token used for body prose. An anchor resting here is the defect.
const BODY_TIER = /\btext-muted\b/;
const UNDERLINED = /\bunderline\b/;

const failures = [];
let checked = 0;

for (const f of sourceFiles().filter((f) => f.rel.endsWith(".tsx"))) {
  const code = stripComments(f.text);

  // Every JSX element that is a link, with its className.
  for (const m of code.matchAll(/<(Link|a)\s([\s\S]*?)>/g)) {
    const attrs = m[2];
    if (!/className=/.test(attrs)) continue;
    checked++;
    const cls = (attrs.match(/className=(?:"([^"]*)"|\{`([^`]*)`\})/) || [])[1] ?? "";
    if (BODY_TIER.test(cls) && !UNDERLINED.test(cls)) {
      const line = code.slice(0, m.index).split("\n").length;
      failures.push(
        `${f.rel}:${line} — <${m[1]}> rests on the body tier (text-muted) with no ` +
          `underline. On a phone, where hover does not exist, it is not a link.`
      );
    }
  }
}

// 2. The current page must be marked.
checked++;
const nav = sourceFiles().find((f) => f.rel.endsWith("components/Navbar.tsx"));
if (!nav) {
  failures.push("Navbar.tsx not found — this gate cannot pass on a file it did not read");
} else if (!/aria-current=/.test(stripComments(nav.text))) {
  failures.push(
    "Navbar.tsx sets no aria-current — nothing marks the current page, and every " +
      "nav item computed identically before this gate existed"
  );
} else {
  // PRESENCE IS NOT CORRECTNESS. This gate asserted only that the string
  // `aria-current=` appeared somewhere in the source, and passed while the
  // phone menu reported Home as the current page on ALL THREE routes: the
  // three mobile links were copy-pasted and every one read `pathname === "/"`.
  // So on /solutions and /contact, a screen-reader user was told they were on
  // Home — which is worse than the "nothing marks the current page" this gate
  // was written to prevent. Found by a dispatched audit that drove the open
  // menu; no substring test could have caught it.
  //
  // Each link's predicate must name that link's OWN href.
  const src = stripComments(nav.text);
  const links = [
    ...src.matchAll(/href="([^"]+)"[\s\S]{0,240}?aria-current=\{pathname === "([^"]+)"/g),
  ];
  if (links.length === 0) {
    failures.push(
      "Navbar.tsx has aria-current but this gate could not pair a single one with an " +
        "href — the markup changed shape and the check can no longer see its subject. " +
        "That is not a pass."
    );
  }
  for (const [, href, tested] of links) {
    checked++;
    if (href !== tested) {
      failures.push(
        `Navbar.tsx — the link to "${href}" marks itself current when pathname is ` +
          `"${tested}". A nav item that claims to be a different page tells a ` +
          `screen-reader user they are somewhere they are not.`
      );
    }
  }
}

report("links are distinguishable and the current page is marked", failures, checked);
