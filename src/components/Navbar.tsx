"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // An overlay that covers the page must also stop the page behind it from
  // scrolling, close on Escape, and hand focus back where it came from.
  // Without these the menu opens, the content scrolls underneath it, and a
  // keyboard user is left with focus on a body they can no longer see.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
        return;
      }
      // Trap Tab inside the overlay. Without this, five Tabs from the close
      // button land on the hero CTA *behind* the menu — keyboard focus walks
      // onto content the overlay is covering, and the visible focus ring goes
      // somewhere the user cannot see.
      if (e.key !== "Tab") return;
      const panel = document.getElementById("mobile-menu");
      if (!panel) return;
      const stops = [
        triggerRef.current,
        ...panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
      ].filter(Boolean) as HTMLElement[];
      if (stops.length === 0) return;
      const first = stops[0];
      const last = stops[stops.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !stops.includes(active as HTMLElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-[72px] transition-colors duration-300 ${
        scrolled ? "bg-carbon/95 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6 md:px-12">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center text-[15px] font-semibold tracking-[0.06em] uppercase text-ink"
        >
          No Guesswork Systems
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className="text-[15px] text-ink/85 hover:text-ink underline-offset-4 aria-[current=page]:underline transition-colors"
          >
            Home
          </Link>
          <Link
            href="/solutions"
            aria-current={pathname === "/solutions" ? "page" : undefined}
            className="text-[15px] text-ink/85 hover:text-ink underline-offset-4 aria-[current=page]:underline transition-colors"
          >
            Solutions
          </Link>
          <Link
            href="/contact"
            aria-current={pathname === "/contact" ? "page" : undefined}
            className="text-[15px] text-ink/85 hover:text-ink underline-offset-4 aria-[current=page]:underline transition-colors"
          >
            Contact
          </Link>
          <Link
            href="/contact"
            className="rounded-lg border border-steel text-steel px-5 py-2 text-[15px] font-medium hover:bg-steel/10 transition-colors"
          >
            Contact Us →
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          ref={triggerRef}
          type="button"
          className="-mr-2.5 flex h-11 w-11 flex-col items-center justify-center gap-[5px] md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span
            className={`block h-[2px] w-6 bg-white transition-transform ${
              menuOpen ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-[2px] w-6 bg-white transition-opacity ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-[2px] w-6 bg-white transition-transform ${
              menuOpen ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

    </nav>

      {/* The overlay is a SIBLING of <nav>, not a child, and that is load-bearing.
          As a child it inherited the nav as its containing block the moment the
          nav gained `backdrop-blur` on scroll — backdrop-filter establishes a
          containing block for fixed-position descendants — so `inset-0 top-72px`
          resolved against the nav's own 72px box and the overlay computed to
          ZERO height. Measured: 740px at scrollY 0, 0px at scrollY 1200, on
          every page at 375px. It screenshots perfectly at the top of the page,
          which is exactly why looking at it did not find this. */}
      {menuOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 top-[72px] bg-carbon z-40 flex flex-col items-center justify-center gap-12 md:hidden overscroll-contain"
        >
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            aria-current={pathname === "/" ? "page" : undefined}
            className="inline-flex min-h-[44px] items-center px-4 text-2xl text-ink/85 hover:text-ink"
          >
            Home
          </Link>
          <Link
            href="/solutions"
            onClick={() => setMenuOpen(false)}
            aria-current={pathname === "/solutions" ? "page" : undefined}
            className="inline-flex min-h-[44px] items-center px-4 text-2xl text-ink/85 hover:text-ink"
          >
            Solutions
          </Link>
          <Link
            href="/contact"
            onClick={() => setMenuOpen(false)}
            aria-current={pathname === "/contact" ? "page" : undefined}
            className="inline-flex min-h-[44px] items-center px-4 text-2xl text-ink/85 hover:text-ink"
          >
            Contact
          </Link>
          <Link
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className="rounded-lg border border-steel text-steel px-8 py-3 text-lg font-medium"
          >
            Contact Us →
          </Link>
        </div>
      )}
    </>
  );
}
