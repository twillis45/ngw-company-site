import type { Metadata } from "next";
import { Button } from "@/components/Button";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Workflow automation and custom business systems. Each one removes a specific act of guessing and replaces it with evidence you can check.",
};

// Two entries were removed on 2026-09-23 for the same reason as the home
// page's cards: no backing artifact in ngw-consulting/case-studies/CLAIM-LEDGER.md.
// Named with their undo as a standing assumption in HANDOFF.md.
const solutions = [
  {
    number: "01",
    title: "Workflow Automation",
    body: "Repeatable work automated to fit the operation already running. Manual touchpoints removed one at a time, each with a way to check it did what it says — not a rebuild you have to adopt wholesale.",
  },
  {
    number: "02",
    title: "Custom Business Systems",
    body: "Fit-for-purpose systems for the places off-the-shelf tools do not fit. The system ends on an action, not a report.",
  },
];

export default function Solutions() {
  return (
    <>
      {/* Hero */}
      <section className="bg-carbon pt-40 pb-20 md:pt-44 md:pb-24">
        <div className="mx-auto max-w-[800px] px-6 md:px-12 text-center">
          <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.08em] text-faint">
            Solutions
          </p>
          <h1 className="mb-5 text-4xl font-semibold leading-tight text-ink md:text-[48px] md:leading-[56px]">
            Each one removes a specific act of guessing
          </h1>
          <p className="text-lg leading-8 text-muted md:text-xl">
            Each one removes a specific act of guessing and replaces it with
            something you can check.
          </p>
        </div>
      </section>

      {/* Solution blocks */}
      {solutions.map((sol, i) => (
        <section
          key={sol.number}
          className={`py-20 md:py-24 ${
            i % 2 === 0 ? "bg-surface" : "bg-carbon"
          }`}
        >
          <div className="mx-auto max-w-[720px] px-6 md:px-12">
            <span aria-hidden="true" className="block text-[64px] font-semibold leading-none text-ink/10 mb-2">
              {sol.number}
            </span>
            <h2 className="mb-4 text-[28px] font-semibold leading-tight text-ink md:text-[32px]">
              {sol.title}
            </h2>
            <p className="text-[17px] leading-7 text-muted">{sol.body}</p>
          </div>
        </section>
      ))}

      {/* Closing CTA */}
      <section className="bg-surface py-20 md:py-24">
        <div className="mx-auto max-w-[600px] px-6 md:px-12 text-center">
          <h2 className="mb-5 text-[28px] font-semibold leading-tight text-ink md:text-[40px] md:leading-[48px]">
            A smarter, more structured way to operate
          </h2>
          <p className="mb-8 text-[17px] leading-7 text-muted">
            If your business needs better systems, clearer workflows, or more
            reliable decision-making — let&apos;s talk.
          </p>
          <Button href="/contact">Contact Us →</Button>
        </div>
      </section>
    </>
  );
}
