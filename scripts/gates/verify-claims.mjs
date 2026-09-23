// Gate: every sentence the SHIPPED site says about this company survives the
// claim ledger.
//
// The ledger at ngw-consulting/case-studies/CLAIM-LEDGER.md records that no
// external client has received either body of consulting work, and prohibits
// the words "client", "engagement" and "delivered to" for them. The site was
// written throughout in the voice of a firm that had done both, and a board
// rated thirteen capability sentences unsubstantiated.
//
// The prohibition is on the FACT ASSERTED, not on three words: "We help
// organizations" is the same assertion with the noun swapped, which is why the
// firm-voice patterns below are part of this gate and not a style preference.
//
// THREE assertion families, and the third is the one that matters most:
//
//   1. No asserted OUTCOME. These claim a result delivered to somebody.
//   2. No FIRM-VOICE. These claim a practice that has done the work.
//   3. ABSENCE. The gate fails if it read fewer than five pages, or if the
//      honest anchor sentence is missing from the home page. Without this a
//      future markup change makes the gate green while it measures nothing —
//      which verify:copy already did once, passing on every page after React
//      began emitting the year as separate text nodes.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ROOT, shippedFiles, sourceFiles, requireExport, report, stripComments } from "./lib.mjs";

requireExport();

// Asserted outcomes — each claims a result for someone. None is measured
// anywhere in the portfolio and no external client is on record.
const OUTCOMES = [
  "Better operational visibility",
  "Faster, more informed decision-making",
  "Less manual effort and fewer bottlenecks",
  "More consistent execution across teams",
  "Systems designed for real-world business use",
];

// Firm-voice: asserts a practice that has delivered.
const FIRM_VOICE = [
  // First AND third person. The ledger prohibits the FACT ASSERTED, not a
  // grammatical person — "No Guesswork Systems LLC helps businesses" and "we
  // help businesses" assert the identical thing. A first version matched only
  // "we help", so the third-person form shipped in the root description, on
  // the home page and the 404, and survived a red-proof of the very gate
  // written to catch it.
  [/\b(we|[A-Z][\w ]*?(?:LLC|Inc|Systems))\s+helps?\s+(organizations|businesses|companies|teams|clients)\b/i,
   "asserts delivery to a population"],
  [/\bour (focus|approach) is\b/i, "asserts an established practice"],
  [/\b(we|[A-Z][\w ]*?(?:LLC|Inc|Systems))\s+(builds?|designs?|develops?|delivers?)\b/i,
   "asserts work performed for someone"],
  [/\bclients?\b/i, "prohibited by the claim ledger"],
  [/\bengagements?\b/i, "prohibited by the claim ledger"],
  [/delivered to/i, "prohibited by the claim ledger"],
];

// The honest anchor. Present tense describing INTENT, not delivery.
const ANCHOR = "was created to help";
const MIN_PAGES = 5;

// Card titles that ship must each carry a row in docs/CAPABILITY-BACKING.md,
// which cites the claim ledger. This is the LEDGER LINK the board asked for,
// and it is a different check from the phrase list above: a card can be worded
// impeccably and still name a capability nothing backs.
const BACKING_DOC = "docs/CAPABILITY-BACKING.md";

const failures = [];
const pages = shippedFiles().filter((f) => f.rel.endsWith(".html"));
let checked = 0;

for (const f of pages) {
  // Visible text AND meta content. Stripping tags erases <meta content="...">
  // entirely, and that is what a link preview, a search result and a screen
  // reader's page description actually show. The root description shipped
  // "helps businesses reduce uncertainty and improve execution" on the home
  // page and the 404 for hours after that sentence was removed from the body,
  // because this gate could not see it.
  const metaContent = (stripComments(f.text).match(/<meta[^>]+content="([^"]*)"/g) || [])
    .map((m) => m.replace(/.*content="/, "").replace(/"$/, ""))
    .join(" \n ");
  const text = stripComments(f.text).replace(/<[^>]+>/g, " ") + " \n " + metaContent;
  checked++;

  for (const claim of OUTCOMES) {
    if (text.includes(claim)) {
      failures.push(`${f.rel} — asserted outcome with nothing behind it: "${claim}"`);
    }
  }
  for (const [re, why] of FIRM_VOICE) {
    const m = text.match(re);
    if (m) failures.push(`${f.rel} — firm-voice ${JSON.stringify(m[0])}: ${why}`);
  }
}

// 3. ABSENCE. This gate must not be able to pass by reading nothing.
checked++;
if (pages.length < MIN_PAGES) {
  failures.push(
    `only ${pages.length} page(s) read, expected at least ${MIN_PAGES} — ` +
      `this gate cannot pass on an export it did not find`
  );
}

checked++;
const home = pages.find((f) => /out\/index\.html$/.test(f.rel));
if (!home) {
  failures.push("out/index.html not found — the home page was not read at all");
} else if (!stripComments(home.text).replace(/<[^>]+>/g, " ").includes(ANCHOR)) {
  failures.push(
    `out/index.html — the honest anchor "${ANCHOR}" is GONE. Either the About ` +
      `section was rewritten, or its markup changed shape and this gate can no ` +
      `longer see it. Both mean this gate stopped measuring.`
  );
}

// 4. THE LEDGER LINK. Every capability title that ships carries a backing row.
checked++;
const backingPath = join(ROOT, BACKING_DOC);
if (!existsSync(backingPath)) {
  failures.push(
    `${BACKING_DOC} is missing — nothing maps the shipped capability titles to ` +
      `the claim ledger, so a card can name anything`
  );
} else {
  const backingRaw = readFileSync(backingPath, "utf8");

  // MATCH ONLY THE LIVE TABLE. A re-score board re-added "AI Decision Support"
  // — a card the doc RETIRED for having no artifact in the ledger — and this
  // gate passed, because the removed-cards table names it in backticks too.
  // The gate's own comment claimed "a row, not a mere mention"; the code did
  // not implement the distinction it described.
  // A ROW, not a mention anywhere above the Removed heading. Slicing on the
  // heading alone was still too loose, and I proved it by defeating my own
  // fix: prose added between the table and that heading — "this offering
  // shipped under two public names — `Custom Systems Design`" — sat inside the
  // live slice and credited a title that had just been retired. That is the
  // same bypass a re-score board had already proved once, reintroduced in the
  // commit fixing it.
  //
  // So: table rows only. A backing row is a `| \`Title\` | ... |` line, and
  // nothing else counts, whatever it says or wherever it sits.
  const removedAt = backingRaw.search(/^##\s+Removed\b/m);
  const liveSlice = removedAt === -1 ? backingRaw : backingRaw.slice(0, removedAt);
  const backingRows = liveSlice
    .split("\n")
    .filter((l) => /^\s*\|\s*`[^`]+`\s*\|/.test(l))
    .join("\n");

  // ENUMERATE EVERY RENDERED TITLE, not two array names. The same board shipped
  // "Guaranteed ROI Analytics" and "Enterprise AI Transformation" in an array
  // called something else and the gate never looked at them. Renaming an array
  // is not a claim review.
  //
  // Page metadata titles are excluded — they are route names, not capability
  // claims, and including them made this gate cry wolf on four rows out of five.
  const titles = new Set();
  for (const f of sourceFiles().filter((f) => f.rel.endsWith(".tsx"))) {
    let code = stripComments(f.text);
    code = code.replace(/export const metadata[\s\S]*?\n\};/g, "");
    for (const m of code.matchAll(/(?:^|[\s{,])title:\s*"([^"]+)"/g)) titles.add(m[1]);
  }

  if (titles.size === 0) {
    failures.push(
      "no capability titles found in source — either they moved, or this check " +
        "can no longer see them. Not a pass either way."
    );
  }
  for (const t of titles) {
    checked++;
    if (!backingRows.includes(`\`${t}\``)) {
      failures.push(
        `"${t}" ships with no backing row in ${BACKING_DOC} — the ledger does ` +
          `not support it, or nobody wrote down that it does`
      );
    }
  }
}

// 5. THE QUALIFIERS ON THE WORKED PROBLEMS.
//
// The claim ledger marks these rows PROVEN *with conditions attached*: the
// corpus is a fixture and row 2 is FALSE if presented as a forecast; the
// $1,802 is synthetic; the twenty-person headcount is illustrative and may
// never be stated as anyone's actual saving. Removing a qualifier turns a
// proven row into a false one — and that edit does not look like vandalism,
// it looks like tightening the copy, which is exactly why it needs a gate
// rather than a note.
//
// Also asserted: every worked problem states where its evidence STOPS. The
// ledger lists the anti-claims and says to leave them in; a page whose promise
// is "evidence you can check" has to show the reader the edge of it.
// Each entry is the QUALIFYING PHRASE, not a bare word. A first version
// checked for "fixture" and stayed green when the qualifier was stripped from
// the prose, because the filename `fixtures/STATEMENT-TOTAL.txt` still matched
// — an incidental occurrence satisfying a check about meaning. It was the most
// important row of the four: the ledger records row 2 as FALSE if the split is
// presented as a forecast rather than as a property of the fixture corpus.
const QUALIFIERS = [
  ["fixture corpus", "the corpus is a fixture; row 2 is FALSE presented as a forecast"],
  ["not a forecast", "row 2's figures are properties of the corpus, not a prediction"],
  ["synthetic", "the $1,802 is synthetic and must be labeled"],
  ["illustrative", "the twenty-person headcount is illustrative, never anyone's actual saving"],
  ["never connected", "the anti-claim the ledger says to leave in"],
];

const homePage = pages.find((f) => /out\/index\.html$/.test(f.rel));
if (homePage) {
  const text = stripComments(homePage.text).replace(/<[^>]+>/g, " ");
  if (text.includes("Worked problems")) {
    for (const [q, why] of QUALIFIERS) {
      checked++;
      if (!new RegExp(q, "i").test(text)) {
        failures.push(`the worked problems ship without the qualifier "${q}" — ${why}`);
      }
    }
    checked++;
    const limits = (text.match(/What it does not show/g) || []).length;
    const entries = (text.match(/The guessing removed:/g) || []).length;
    if (entries === 0) {
      failures.push("a Worked problems section with no entries — this gate cannot pass on an empty one");
    } else if (limits < entries) {
      failures.push(
        `${entries} worked problem(s) but only ${limits} state where the evidence stops. ` +
          `The ledger lists the anti-claims and says to leave them in.`
      );
    }
  }
}

report("every shipped claim survives the claim ledger", failures, checked);
