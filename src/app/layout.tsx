import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { site } from "@/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  // Required for absolute URLs in the sitemap, canonical and OG tags. Without
  // it every link preview of this site was a bare, imageless text card.
  metadataBase: new URL(`https://${site.domain}`),
  alternates: { canonical: "/" },
  title: {
    default: "No Guesswork Systems — AI, Automation & Decision-Support Systems",
    template: "%s — No Guesswork Systems",
  },
  // This is what a link preview shows, and it outlived every rewrite of the
  // page body — "helps businesses reduce uncertainty and improve execution" is
  // the firm-voice the claim ledger prohibits, still shipping on the home page
  // and the 404 hours after it was removed from the visible copy. It survived
  // because verify:claims read text content, and a meta tag has none.
  description:
    "No Guesswork Systems LLC was created to take one act of guessing out of an operation at a time, and to show the evidence so you can verify it rather than trust it.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: site.shortName,
    url: `https://${site.domain}`,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-carbon text-muted">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
