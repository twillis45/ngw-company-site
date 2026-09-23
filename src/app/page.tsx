import { Button } from "@/components/Button";
import { ServiceCard } from "@/components/ServiceCard";
import { WorkedProblem } from "@/components/WorkedProblem";

// Two cards were removed on 2026-09-23. Neither had a backing artifact in
// ngw-consulting/case-studies/CLAIM-LEDGER.md, and one of the two is also the
// term Google Suggest rewrites to "business intelligence consultant". Both are
// named, with their undo, as a standing assumption in HANDOFF.md.
const services = [
  {
    title: "Workflow Automation",
    body: "Repeatable work automated to fit the operation already running — not automation that needs a rebuild before it can be adopted.",
  },
  {
    title: "Custom Business Systems",
    body: "Fit-for-purpose systems for the places off-the-shelf tools do not fit.",
  },
];

// These were five asserted OUTCOMES, with no measurement behind any of them
// and no external client on record. Replaced with the operating rules from the
// brand's own promise document, which are true today because they describe how
// the work is done rather than what it achieved for somebody.
const supportingPoints = [
  "Every claim carries where it came from",
  "Where the source is unknown, that is stated rather than dressed up",
  "A confident tone is never a substitute for a check",
  "Hints are labeled hints; a measured 0.6% is reported as 0.6%",
  "Every system ends on an action, not a report",
];

// Sourced line by line from the PROVEN rows of
// ngw-consulting/case-studies/CLAIM-LEDGER.md. Nothing here is written from
// memory, and every qualifier the ledger attaches to a figure is carried with
// it — "fixture corpus", "synthetic", "illustrative headcount". Removing a
// qualifier turns a proven row into a false one, and verify:claims refuses it.
const workedProblems = [
  {
    number: "01",
    title: "Reconciling a corporate card against an expense system",
    removed:
      "The guessing removed: which of a month's charges are actually unexplained, and which only look that way because two systems disagree about the same transaction.",
    evidence: [
      { claim: "118 charges split into 80 cleared, 25 assistant tasks, 17 questions for the CEO",
        check: "engine.test.js, on the fixture corpus" },
      { claim: "Reports the account short by $1,802.00",
        check: "fixtures/STATEMENT-TOTAL.txt — synthetic, and labeled" },
      { claim: "A test asserts the collapsed total matches the export to the cent",
        check: "engine.test.js:22" },
      { claim: "Zero network requests; the data never leaves the page",
        check: "render.test.js:102, verifiable in DevTools" },
      { claim: "211 assertions pass",
        check: "./test/run.sh" },
    ],
    limit:
      "The corpus is a fixture, not a real month — the 118, the 80/25/17 split and the $1,802 are properties of that corpus and not a forecast. Calendar corroboration sits at 19%, 23 of 118, and that is the model's weakest joint; it is disclosed rather than relied on.",
  },
  {
    number: "02",
    title: "A governance cycle that spans several tools",
    removed:
      "The guessing removed: whether one item tracked in several places can stay one item, and what the tooling actually costs to do it.",
    evidence: [
      { claim: "Multi-homing works, and needs no paid plan",
        check: "Executed against the API on a free workspace, 6 Aug 2026" },
      { claim: "Starter $10.99, Advanced $24.99 — and Advanced adds nothing this design uses",
        check: "asana.com/pricing, re-fetched" },
      { claim: "$3,360 a year on a twenty-person staff",
        check: "($24.99 − $10.99) × 20 × 12 — headcount illustrative" },
      { claim: "Seven projects stood up, four before and three after",
        check: "GID table, 6 Aug 2026 — a personal workspace" },
    ],
    limit:
      "Designed from a verbal description. The company workspace was never connected, six assumptions in the plan are flagged and uncorrected, and the twenty-person figure is arithmetic on an illustrative headcount — never anyone's actual saving.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="bg-carbon pt-40 pb-28 md:pt-44 md:pb-32">
        <div className="mx-auto max-w-[1200px] px-6 md:px-12">
          <div className="max-w-[600px]">
            <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.08em] text-faint">
              AI · Automation · Decision Support
            </p>
            <h1 className="mb-5 text-4xl font-semibold leading-[1.14] text-ink md:text-[56px] md:leading-[64px]">
              Remove one act of guessing. Replace it with evidence you can
              check.
            </h1>
            <p className="mb-8 text-lg leading-8 text-muted md:text-xl md:leading-8">
              No Guesswork Systems LLC was created to take one act of guessing out
              of an operation at a time, and to show the evidence so you can
              verify it rather than trust it.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button href="/contact">Contact Us</Button>
              <Button href="/solutions" variant="secondary">
                Explore Solutions →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="bg-surface py-24 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 md:px-12">
          <div className="mx-auto max-w-[640px] text-center mb-12">
            <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.08em] text-faint">
              Capabilities
            </p>
            <h2 className="mb-5 text-[28px] font-semibold leading-tight text-ink md:text-[40px] md:leading-[48px]">
              What We Do
            </h2>
            <p className="text-[17px] leading-7 text-muted">
              Each system targets one specific act of guessing and replaces it with
              something checkable. The work is implementation, not advice.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {services.map((s) => (
              <ServiceCard key={s.title} title={s.title} body={s.body} />
            ))}
          </div>
        </div>
      </section>

      {/* Operating rules */}
      <section className="bg-paper py-24 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 md:px-12">
          <div className="flex flex-col gap-10 md:flex-row md:gap-16">
            <div className="md:w-1/2">
              <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.08em] text-ink-support">
                Operating rules
              </p>
              <h2 className="mb-5 text-[28px] font-semibold leading-tight text-carbon md:text-[40px] md:leading-[48px]">
                How the work is done
              </h2>
              <p className="max-w-[480px] text-[17px] leading-7 text-ink-support">
                The promise is narrow on purpose: less doubt, not more
                output. These are the rules the work follows, not results it
                has produced for someone — and they are checkable, which is the
                whole point of stating them.
              </p>
            </div>
            <div className="md:w-1/2">
              <ul className="space-y-8">
                {supportingPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span aria-hidden="true" className="mt-1 text-ink-support text-lg">✓</span>
                    <span className="text-[17px] leading-7 text-ink-dark">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-carbon py-24 md:py-28 border-y border-hair">
        <div className="mx-auto max-w-[680px] px-6 md:px-12 text-center">
          <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.08em] text-faint">
            About the Company
          </p>
          <h2 className="mb-5 text-[28px] font-semibold leading-tight text-ink md:text-[40px] md:leading-[48px]">
            Built for practical business use
          </h2>
          <p className="text-[17px] leading-7 text-muted">
            No Guesswork Systems LLC was created to help businesses work toward
            more structure, clarity, and consistency in the way they operate. The
            company focuses on practical AI, automation, decision-support tools,
            and operational systems designed to reduce friction and support
            better outcomes — without unnecessary complexity.
          </p>
        </div>
      </section>

      {/* Contact CTA */}
      {/* Worked problems */}
      <section className="bg-carbon py-24 md:py-28 border-y border-hair">
        <div className="mx-auto max-w-[760px] px-6 md:px-12">
          <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.08em] text-faint">
            Worked problems
          </p>
          <h2 className="mb-5 text-[28px] font-semibold leading-tight text-ink md:text-[40px] md:leading-[48px]">
            Two of them, with the checks
          </h2>
          <p className="mb-12 max-w-[62ch] text-[17px] leading-7 text-muted">
            These are problems worked through end to end, not accounts of work
            done for someone else — no outside party has received either. Every
            figure below names the check behind it, and every one says where the
            evidence stops.
          </p>
          <div className="space-y-14">
            {workedProblems.map((w) => (
              <WorkedProblem key={w.number} {...w} />
            ))}
          </div>
        </div>
      </section>
      <section className="bg-surface py-20 md:py-24">
        <div className="mx-auto max-w-[520px] px-6 md:px-12 text-center">
          <h2 className="mb-5 text-[28px] font-semibold leading-tight text-ink md:text-[40px] md:leading-[48px]">
            Start the conversation
          </h2>
          <p className="mb-8 text-[17px] leading-7 text-muted">
            For business inquiries, partnerships, and early conversations, reach
            out to No Guesswork Systems LLC.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            {/* ASSUMPTION (owner-held, undo = swap these two variants): the
                hero action is the contact form at /contact, not the raw
                mailto:. The form composes the same message and is the
                destination the nav already points at; the mailto stays
                reachable as the secondary. Ruling this the other way is a
                two-token edit. */}
            <Button href="/contact">Contact Us</Button>
            <Button
              href="mailto:info@noguessworksystems.com"
              variant="secondary"
              external
            >
              Email Us Directly →
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
