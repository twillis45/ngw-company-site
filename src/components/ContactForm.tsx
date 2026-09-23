"use client";

import { useState } from "react";
import { site } from "@/site";

// Composes the inquiry into the visitor's own mail client. There is no
// endpoint, no processor and no network call.
//
// What it replaced, and why the replacement is shaped like this: this form
// used to POST to a third-party form relay at an ID that was never filled in
// — the URL ended in the literal word the scaffold left behind — and then show "Message sent. We'll be in touch soon." The
// endpoint returned 404 for every submission from 2026-03-27 onward.
//
// The reason nobody noticed is worth keeping written down. `await fetch()`
// RESOLVES on an HTTP 404; it rejects only on a network-layer failure. So the
// try block ran straight on to setSubmitted(true), and the catch — which also
// set success — was never even reached. There was no input, no outage and no
// server response that could have made that form report a failure. Every
// visitor who wrote in was thanked, and nothing was delivered.
//
// Handing off to the mail client removes the failure mode rather than
// handling it: delivery is now the visitor's own mail app's job, and they can
// see the message sitting in their outbox. The address is shown in plain text
// beside the form as well, so the path does not depend on a mail handler
// being registered at all.

export function ContactForm() {
  const [handedOff, setHandedOff] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const company = String(data.get("company") || "").trim();
    const message = String(data.get("message") || "").trim();

    const subject = `Website inquiry — ${name || "no name given"}`;
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      company ? `Company: ${company}` : null,
      "",
      message,
    ]
      .filter((line) => line !== null)
      .join("\n");

    window.location.href =
      `mailto:${site.email}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    setHandedOff(true);
  }

  if (handedOff) {
    return (
      <div className="rounded-2xl border border-hair bg-surface-2 p-10 text-center">
        <p className="text-xl font-semibold text-ink mb-2">
          Your email app should be opening
        </p>
        <p className="text-muted">
          Your message is drafted and ready to send — it is not sent until you
          send it. If nothing opened, email{" "}
          <a
            href={`mailto:${site.email}`}
            className="text-steel hover:underline"
          >
            {site.email}
          </a>{" "}
          directly.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-hair bg-surface px-4 py-3.5 text-ink placeholder:text-faint focus:border-steel focus:outline-none transition-colors";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-hair bg-surface-2 p-10"
    >
      <div className="space-y-5">
        <div>
          <label htmlFor="cf-name" className="mb-1.5 block text-sm font-medium text-muted">
            Name
          </label>
          <input id="cf-name" type="text" name="name" required className={inputClass} placeholder="Your name" />
        </div>
        <div>
          <label htmlFor="cf-email" className="mb-1.5 block text-sm font-medium text-muted">
            Email
          </label>
          <input id="cf-email" type="email" name="email" required className={inputClass} placeholder="you@company.com" />
        </div>
        <div>
          <label htmlFor="cf-company" className="mb-1.5 block text-sm font-medium text-muted">
            Company <span className="text-muted font-normal">(optional)</span>
          </label>
          <input id="cf-company" type="text" name="company" className={inputClass} placeholder="Company name" />
        </div>
        <div>
          <label htmlFor="cf-message" className="mb-1.5 block text-sm font-medium text-muted">
            Message
          </label>
          <textarea
            id="cf-message"
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
        className="mt-6 w-full rounded-lg bg-steel px-7 py-3.5 text-[15px] font-medium text-carbon hover:bg-steel-hover transition-colors"
      >
        Compose Message
      </button>
      <p className="mt-4 text-center text-[13px] text-muted">
        Opens in your email app. Or write to{" "}
        <a href={`mailto:${site.email}`} className="text-steel hover:underline">
          {site.email}
        </a>
        .
      </p>
    </form>
  );
}
