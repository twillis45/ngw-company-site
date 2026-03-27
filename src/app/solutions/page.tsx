import type { Metadata } from "next";
import { Button } from "@/components/Button";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "AI decision support, workflow automation, operational reporting, and custom business systems designed for practical, real-world use.",
};

const solutions = [
  {
    number: "01",
    title: "AI Decision Support",
    body: "Use AI to organize information, structure thinking, and guide more consistent next steps. We build decision-support workflows that help teams move from ambiguity to action — without replacing human judgment.",
  },
  {
    number: "02",
    title: "Workflow Automation",
    body: "Automate repeatable work, reduce manual touchpoints, and improve process reliability. We design automation that fits existing operations — not automation that requires a full rebuild to adopt.",
  },
  {
    number: "03",
    title: "Operational Reporting & Visibility",
    body: "Create structured views of business activity that support leadership awareness and better follow-through. Know what's happening, what needs attention, and where execution is falling short.",
  },
  {
    number: "04",
    title: "Custom Business Systems",
    body: "Develop fit-for-purpose systems and workflows aligned to specific business needs. Off-the-shelf tools don't always fit — we build what does.",
  },
];

export default function Solutions() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy pt-40 pb-20 md:pt-44 md:pb-24">
        <div className="mx-auto max-w-[800px] px-6 md:px-12 text-center">
          <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.08em] text-accent">
            Solutions
          </p>
          <h1 className="mb-5 text-4xl font-semibold leading-tight text-white md:text-[48px] md:leading-[56px]">
            Solutions built to reduce guesswork in business operations
          </h1>
          <p className="text-lg leading-8 text-cool-gray md:text-xl">
            We help businesses improve decision-making, streamline operations,
            and build systems that support clearer execution.
          </p>
        </div>
      </section>

      {/* Solution blocks */}
      {solutions.map((sol, i) => (
        <section
          key={sol.number}
          className={`py-20 md:py-24 ${
            i % 2 === 0 ? "bg-charcoal" : "bg-navy"
          }`}
        >
          <div className="mx-auto max-w-[720px] px-6 md:px-12">
            <span className="block text-[64px] font-semibold leading-none text-accent/15 mb-2">
              {sol.number}
            </span>
            <h2 className="mb-4 text-[28px] font-semibold leading-tight text-white md:text-[32px]">
              {sol.title}
            </h2>
            <p className="text-[17px] leading-7 text-cool-gray">{sol.body}</p>
          </div>
        </section>
      ))}

      {/* Closing CTA */}
      <section className="bg-charcoal py-20 md:py-24">
        <div className="mx-auto max-w-[600px] px-6 md:px-12 text-center">
          <h2 className="mb-5 text-[28px] font-semibold leading-tight text-white md:text-[40px] md:leading-[48px]">
            A smarter, more structured way to operate
          </h2>
          <p className="mb-8 text-[17px] leading-7 text-cool-gray">
            If your business needs better systems, clearer workflows, or more
            reliable decision-making — let&apos;s talk.
          </p>
          <Button href="/contact">Contact Us →</Button>
        </div>
      </section>
    </>
  );
}
