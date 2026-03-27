import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "No Guesswork Systems — AI, Automation & Decision-Support Systems",
    template: "%s — No Guesswork Systems",
  },
  description:
    "No Guesswork Systems LLC helps businesses reduce uncertainty and improve execution through practical AI, workflow automation, and business systems design.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "No Guesswork Systems",
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
