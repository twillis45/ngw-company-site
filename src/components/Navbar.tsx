"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-[72px] transition-colors duration-300 ${
        scrolled ? "bg-navy/95 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6 md:px-12">
        <Link
          href="/"
          className="text-[15px] font-semibold tracking-[0.06em] uppercase text-white"
        >
          No Guesswork Systems
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
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
            href="/contact"
            className="rounded-lg border border-accent text-accent px-5 py-2 text-[15px] font-medium hover:bg-accent/10 transition-colors"
          >
            Contact Us →
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex flex-col gap-[5px] md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
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

      {/* Mobile overlay */}
      {menuOpen && (
        <div className="fixed inset-0 top-[72px] bg-navy z-40 flex flex-col items-center justify-center gap-12 md:hidden">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="text-2xl text-light-gray hover:text-white"
          >
            Home
          </Link>
          <Link
            href="/solutions"
            onClick={() => setMenuOpen(false)}
            className="text-2xl text-light-gray hover:text-white"
          >
            Solutions
          </Link>
          <Link
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className="text-2xl text-light-gray hover:text-white"
          >
            Contact
          </Link>
          <Link
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className="rounded-lg border border-accent text-accent px-8 py-3 text-lg font-medium"
          >
            Contact Us →
          </Link>
        </div>
      )}
    </nav>
  );
}
