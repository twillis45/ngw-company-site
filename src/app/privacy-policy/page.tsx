import type { Metadata } from "next";
import { site } from "@/site";
import { Button } from "@/components/Button";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for noguessworksystems.com.",
};

export default function PrivacyPolicy() {
  return (
    <section className="bg-carbon pt-40 pb-24 md:pt-44 md:pb-28">
      <div className="mx-auto max-w-[680px] px-6 md:px-12">
        <h1 className="mb-2 text-[28px] font-semibold leading-tight text-ink md:text-[40px] md:leading-[48px]">
          Privacy Policy
        </h1>
        <p className="mb-10 text-[13px] text-muted">
          Last updated: {site.lastPolicyUpdate}
        </p>

        <div className="space-y-6 text-[17px] leading-7 text-muted">
          <p>
            No Guesswork Systems LLC (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
            &ldquo;our&rdquo;) respects your privacy. This page describes how we
            handle information collected through noguessworksystems.com.
          </p>

          <h2 className="text-[18px] font-semibold text-ink pt-2">
            1. Information We Collect
          </h2>
          <p>
            This site collects nothing. It is a set of static pages with no
            database, no accounts, and no server-side processing of your
            information. The contact form does not transmit anything: it
            composes a draft in your own email application, which you then
            choose to send or discard.
          </p>

          <h2 className="text-[18px] font-semibold text-ink pt-2">
            2. How We Use Information
          </h2>
          <p>
            If you email us, we use your message and address solely to respond
            to your inquiry and conduct business communications. We do not use
            it for marketing and we do not sell it. Correspondence is retained
            in our business mailbox for as long as needed to serve the inquiry
            and to meet record-keeping obligations. To ask what we hold about
            you, or to have correspondence deleted, email us at the address
            below and we will respond within 30 days.
          </p>

          <h2 className="text-[18px] font-semibold text-ink pt-2">
            3. Third Parties
          </h2>
          <p>
            We do not sell, trade, or share personal information with third
            parties for their marketing purposes. Two service providers are
            nonetheless in the path of every request to this site and are named
            here for completeness: Render hosts the static files, and Cloudflare
            sits in front of it as CDN and proxy. Both process standard request
            metadata, including your IP address, in order to serve the page.
          </p>

          <h2 className="text-[18px] font-semibold text-ink pt-2">
            4. Cookies
          </h2>
          <p>
            This site sets no cookies and runs no analytics. There is no
            tracking script, no tag manager, and no advertising pixel on any
            page. You can confirm this yourself: the site sends no{" "}
            <code className="px-1 text-ink">Set-Cookie</code> header on any
            page, and its scripts contain no analytics code.
          </p>

          <h2 className="text-[18px] font-semibold text-ink pt-2">
            5. Contact
          </h2>
          <p>
            For privacy-related questions, email{" "}
            <a
              href="mailto:info@noguessworksystems.com"
              className="text-steel hover:text-steel-hover"
            >
              info@noguessworksystems.com
            </a>
            .
          </p>

          <p className="pt-2">
            This policy may be updated periodically. Changes will be reflected on
            this page with an updated date.
          </p>

          {/* A reader reaches these two pages holding a QUESTION more often
              than any other page on the site, and until now neither offered
              anything to do with it beyond an inline mailto in the body. */}
          <div className="pt-8">
            <Button href="/contact">Ask a privacy question</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
