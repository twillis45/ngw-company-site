import Link from "next/link";
import { site } from "@/site";

export function Footer() {
  return (
    <footer className="border-t border-slate-surface bg-navy">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12 pt-16 pb-8">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          {/* Left column */}
          <div className="space-y-3">
            <p className="text-[15px] font-semibold tracking-[0.06em] uppercase text-white">
              No Guesswork Systems
            </p>
            <a
              href={`mailto:${site.email}`}
              className="block text-[15px] text-light-gray hover:text-white transition-colors"
            >
              {site.email}
            </a>
            <p className="text-[15px] text-cool-gray">
              {site.address.street}
              <br />
              {site.address.cityStateZip}
            </p>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="text-[15px] text-light-gray hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/solutions"
              className="text-[15px] text-light-gray hover:text-white transition-colors"
            >
              Solutions
            </Link>
            <Link
              href="/contact"
              className="text-[15px] text-light-gray hover:text-white transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/privacy-policy"
              className="text-[15px] text-light-gray hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-[15px] text-light-gray hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-slate-surface pt-6">
          <p className="text-center text-[13px] text-cool-gray">
            © {site.year} {site.legalName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
