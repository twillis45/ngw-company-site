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
  description:
    "No Guesswork Systems LLC helps businesses reduce uncertainty and improve execution through practical AI, workflow automation, and business systems design.",
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
      <body className="bg-navy text-cool-gray">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
