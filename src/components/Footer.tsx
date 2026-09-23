import Link from "next/link";
import { site } from "@/site";

export function Footer() {
  return (
    <footer className="border-t border-hair bg-carbon">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12 pt-16 pb-8">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          {/* Left column */}
          <div className="space-y-3">
            <p className="text-[15px] font-semibold tracking-[0.06em] uppercase text-ink">
              No Guesswork Systems
            </p>
            <a
              href={`mailto:${site.email}`}
              className="inline-flex min-h-[44px] items-center text-[15px] text-ink/85 underline underline-offset-4 hover:text-ink transition-colors"
            >
              {site.email}
            </a>
            <p className="text-[15px] text-muted">
              {site.address.street}
              <br />
              {site.address.cityStateZip}
            </p>
          </div>

          {/* Right column */}
          <div className="flex flex-col">
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center text-[15px] text-ink/85 hover:text-ink underline-offset-4 hover:underline transition-colors"
            >
              Home
            </Link>
            <Link
              href="/solutions"
              className="inline-flex min-h-[44px] items-center text-[15px] text-ink/85 hover:text-ink underline-offset-4 hover:underline transition-colors"
            >
              Solutions
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-[44px] items-center text-[15px] text-ink/85 hover:text-ink underline-offset-4 hover:underline transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/privacy-policy"
              className="inline-flex min-h-[44px] items-center text-[15px] text-ink/85 hover:text-ink underline-offset-4 hover:underline transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="inline-flex min-h-[44px] items-center text-[15px] text-ink/85 hover:text-ink underline-offset-4 hover:underline transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-hair pt-6">
          <p className="text-center text-[13px] text-muted">
            © {site.year} {site.legalName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
