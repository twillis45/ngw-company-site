import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for noguessworksystems.com.",
};

export default function TermsOfService() {
  return (
    <section className="bg-navy pt-40 pb-24 md:pt-44 md:pb-28">
      <div className="mx-auto max-w-[680px] px-6 md:px-12">
        <h1 className="mb-2 text-[28px] font-semibold leading-tight text-white md:text-[40px] md:leading-[48px]">
          Terms of Service
        </h1>
        <p className="mb-10 text-[13px] text-cool-gray">
          Last updated: March 2025
        </p>

        <div className="space-y-6 text-[17px] leading-7 text-cool-gray">
          <p>
            These terms govern your use of noguessworksystems.com, operated by
            No Guesswork Systems LLC.
          </p>

          <h2 className="text-[18px] font-semibold text-light-gray pt-2">
            1. Use of This Site
          </h2>
          <p>
            This website is provided for informational and business inquiry
            purposes. All content is owned by No Guesswork Systems LLC unless
            otherwise stated.
          </p>

          <h2 className="text-[18px] font-semibold text-light-gray pt-2">
            2. No Guarantees
          </h2>
          <p>
            Information on this site is provided as-is. We make no warranties
            regarding completeness, accuracy, or suitability for any particular
            purpose.
          </p>

          <h2 className="text-[18px] font-semibold text-light-gray pt-2">
            3. Limitation of Liability
          </h2>
          <p>
            No Guesswork Systems LLC shall not be held liable for damages arising
            from the use of this website or its content.
          </p>

          <h2 className="text-[18px] font-semibold text-light-gray pt-2">
            4. Governing Law
          </h2>
          <p>
            These terms are governed by the laws of the State of Maryland.
          </p>

          <h2 className="text-[18px] font-semibold text-light-gray pt-2">
            5. Contact
          </h2>
          <p>
            For questions regarding these terms, email{" "}
            <a
              href="mailto:info@noguessworksystems.com"
              className="text-accent hover:text-accent-hover"
            >
              info@noguessworksystems.com
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
