import type { Metadata } from "next";
import { site } from "@/site";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with No Guesswork Systems LLC for business inquiries, partnerships, and project conversations.",
};

export default function Contact() {
  return (
    <section className="bg-carbon pt-40 pb-24 md:pt-44 md:pb-28">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <div className="flex flex-col gap-12 md:flex-row md:gap-16">
          {/* Left column */}
          <div className="md:w-[55%]">
            <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.08em] text-faint">
              Get in Touch
            </p>
            <h1 className="mb-5 text-4xl font-semibold leading-tight text-ink md:text-[44px] md:leading-[52px]">
              Contact No Guesswork Systems LLC
            </h1>
            <p className="mb-12 text-[17px] leading-7 text-muted">
              For business inquiries, partnerships, or general questions, use the
              form or email us directly.
            </p>

            <hr className="border-hair mb-8" />

            <div className="space-y-3">
              <a
                href="mailto:info@noguessworksystems.com"
                className="block text-[17px] text-muted hover:text-ink transition-colors"
              >
                info@noguessworksystems.com
              </a>
              <p className="text-[15px] text-muted">
                {site.address.street}
                <br />
                {site.address.cityStateZip}
              </p>
            </div>
          </div>

          {/* Right column */}
          <div className="md:w-[45%]">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
