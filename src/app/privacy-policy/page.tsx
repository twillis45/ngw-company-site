import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for noguessworksystems.com.",
};

export default function PrivacyPolicy() {
  return (
    <section className="bg-navy pt-40 pb-24 md:pt-44 md:pb-28">
      <div className="mx-auto max-w-[680px] px-6 md:px-12">
        <h1 className="mb-2 text-[28px] font-semibold leading-tight text-white md:text-[40px] md:leading-[48px]">
          Privacy Policy
        </h1>
        <p className="mb-10 text-[13px] text-cool-gray">
          Last updated: March 2025
        </p>

        <div className="space-y-6 text-[17px] leading-7 text-cool-gray">
          <p>
            No Guesswork Systems LLC (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
            &ldquo;our&rdquo;) respects your privacy. This page describes how we
            handle information collected through noguessworksystems.com.
          </p>

          <h2 className="text-[18px] font-semibold text-light-gray pt-2">
            1. Information We Collect
          </h2>
          <p>
            We may collect basic contact information — such as your name, email
            address, and company name — when you submit our contact form.
          </p>

          <h2 className="text-[18px] font-semibold text-light-gray pt-2">
            2. How We Use Information
          </h2>
          <p>
            Information submitted through the contact form is used solely to
            respond to your inquiry and conduct business communications. We do
            not use it for marketing or sell it to third parties.
          </p>

          <h2 className="text-[18px] font-semibold text-light-gray pt-2">
            3. Third Parties
          </h2>
          <p>
            We do not sell, trade, or share personal information with third
            parties for their marketing purposes.
          </p>

          <h2 className="text-[18px] font-semibold text-light-gray pt-2">
            4. Cookies
          </h2>
          <p>
            This site may use basic analytics cookies to understand site traffic.
            No personally identifiable information is tracked or stored through
            cookies.
          </p>

          <h2 className="text-[18px] font-semibold text-light-gray pt-2">
            5. Contact
          </h2>
          <p>
            For privacy-related questions, email{" "}
            <a
              href="mailto:info@noguessworksystems.com"
              className="text-accent hover:text-accent-hover"
            >
              info@noguessworksystems.com
            </a>
            .
          </p>

          <p className="pt-2">
            This policy may be updated periodically. Changes will be reflected on
            this page with an updated date.
          </p>
        </div>
      </div>
    </section>
  );
}
