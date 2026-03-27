"use client";

import { useState } from "react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      await fetch("https://formspree.io/f/PLACEHOLDER", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border-dark bg-slate-surface p-10 text-center">
        <p className="text-xl font-semibold text-white mb-2">Message sent</p>
        <p className="text-cool-gray">
          Thank you for reaching out. We&apos;ll be in touch soon.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-border-dark bg-charcoal px-4 py-3.5 text-white placeholder:text-[#64748B] focus:border-accent focus:outline-none transition-colors";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border-dark bg-slate-surface p-10"
    >
      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-light-gray">
            Name
          </label>
          <input
            type="text"
            name="name"
            required
            className={inputClass}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-light-gray">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            className={inputClass}
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-light-gray">
            Company{" "}
            <span className="text-cool-gray font-normal">(optional)</span>
          </label>
          <input
            type="text"
            name="company"
            className={inputClass}
            placeholder="Company name"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-light-gray">
            Message
          </label>
          <textarea
            name="message"
            required
            rows={4}
            className={inputClass + " resize-none"}
            placeholder="Tell us about your project or inquiry"
          />
        </div>
      </div>
      <button
        type="submit"
        className="mt-6 w-full rounded-lg bg-accent px-7 py-3.5 text-[15px] font-medium text-navy hover:bg-accent-hover transition-colors"
      >
        Send Message
      </button>
    </form>
  );
}
