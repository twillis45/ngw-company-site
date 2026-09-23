import { Button } from "@/components/Button";
import { ServiceCard } from "@/components/ServiceCard";

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
    title: "Custom Systems Design",
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

      {/* Why No Guesswork Systems */}
      <section className="bg-paper py-24 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 md:px-12">
          <div className="flex flex-col gap-10 md:flex-row md:gap-16">
            <div className="md:w-1/2">
              <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.08em] text-ink-support">
                Our Approach
              </p>
              <h2 className="mb-5 text-[28px] font-semibold leading-tight text-carbon md:text-[40px] md:leading-[48px]">
                Why No Guesswork Systems
              </h2>
              <p className="max-w-[480px] text-[17px] leading-7 text-ink-support">
                The promise is narrow on purpose: less doubt, not more output. Every
                AI agency sells more — more leads, more reach, bigger numbers on
                a screenshot. This sells fewer things you have to take on faith.
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
            No Guesswork Systems LLC exists to serve businesses work toward
            more structure, clarity, and consistency in the way they operate. The
            company focuses on practical AI, automation, decision-support tools,
            and operational systems designed to reduce friction and support
            better outcomes — without unnecessary complexity.
          </p>
        </div>
      </section>

      {/* Contact CTA */}
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
            <Button href="mailto:info@noguessworksystems.com" external>
              Email Us
            </Button>
            <Button href="/contact" variant="secondary">
              Contact Page →
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
