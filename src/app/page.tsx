import { Button } from "@/components/Button";
import { ServiceCard } from "@/components/ServiceCard";

const services = [
  {
    title: "AI Decision Support",
    body: "Help turn complex inputs into clearer next actions with structured, AI-assisted workflows.",
  },
  {
    title: "Workflow Automation",
    body: "Reduce repetitive tasks, manual bottlenecks, and process friction across recurring operations.",
  },
  {
    title: "Operational Intelligence",
    body: "Build reporting, dashboards, and analysis structures that help leadership see what matters.",
  },
  {
    title: "Custom Systems Design",
    body: "Develop fit-for-purpose systems aligned to how your business actually operates.",
  },
];

const supportingPoints = [
  "Better operational visibility",
  "Faster, more informed decision-making",
  "Less manual effort and fewer bottlenecks",
  "More consistent execution across teams",
  "Systems designed for real-world business use",
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy pt-40 pb-28 md:pt-44 md:pb-32">
        <div className="mx-auto max-w-[1200px] px-6 md:px-12">
          <div className="max-w-[600px]">
            <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.08em] text-accent">
              AI · Automation · Decision Support
            </p>
            <h1 className="mb-5 text-4xl font-semibold leading-[1.14] text-white md:text-[56px] md:leading-[64px]">
              Practical systems designed to reduce guesswork in business
              operations
            </h1>
            <p className="mb-8 text-lg leading-8 text-cool-gray md:text-xl md:leading-8">
              No Guesswork Systems LLC helps businesses bring structure to
              operations through practical AI, workflow automation, and
              decision-support systems — so leadership can work toward more
              clarity and less uncertainty.
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
      <section className="bg-charcoal py-24 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 md:px-12">
          <div className="mx-auto max-w-[640px] text-center mb-12">
            <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.08em] text-accent">
              Capabilities
            </p>
            <h2 className="mb-5 text-[28px] font-semibold leading-tight text-white md:text-[40px] md:leading-[48px]">
              What We Do
            </h2>
            <p className="text-[17px] leading-7 text-cool-gray">
              We help organizations address inconsistent workflows and unclear
              decision-making by building more structured, usable systems. Our
              focus is practical implementation — designed to improve visibility,
              consistency, and execution.
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
      <section className="bg-off-white py-24 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 md:px-12">
          <div className="flex flex-col gap-10 md:flex-row md:gap-16">
            <div className="md:w-1/2">
              <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.08em] text-accent">
                Our Approach
              </p>
              <h2 className="mb-5 text-[28px] font-semibold leading-tight text-navy md:text-[40px] md:leading-[48px]">
                Why No Guesswork Systems
              </h2>
              <p className="max-w-[480px] text-[17px] leading-7 text-border-dark">
                We focus on practical systems, not hype. The goal is to reduce
                uncertainty, improve execution, and help businesses operate with
                more clarity and control.
              </p>
            </div>
            <div className="md:w-1/2">
              <ul className="space-y-8">
                {supportingPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-1 text-accent text-lg">✓</span>
                    <span className="text-[17px] leading-7 text-charcoal">
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
      <section className="bg-navy py-24 md:py-28 border-y border-slate-surface">
        <div className="mx-auto max-w-[680px] px-6 md:px-12 text-center">
          <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.08em] text-accent">
            About the Company
          </p>
          <h2 className="mb-5 text-[28px] font-semibold leading-tight text-white md:text-[40px] md:leading-[48px]">
            Built for practical business use
          </h2>
          <p className="text-[17px] leading-7 text-cool-gray">
            No Guesswork Systems LLC was created to help businesses work toward
            more structure, clarity, and consistency in the way they operate. The
            company focuses on practical AI, automation, decision-support tools,
            and operational systems designed to reduce friction and support
            better outcomes — without unnecessary complexity.
          </p>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-charcoal py-20 md:py-24">
        <div className="mx-auto max-w-[520px] px-6 md:px-12 text-center">
          <h2 className="mb-5 text-[28px] font-semibold leading-tight text-white md:text-[40px] md:leading-[48px]">
            Start the conversation
          </h2>
          <p className="mb-8 text-[17px] leading-7 text-cool-gray">
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
