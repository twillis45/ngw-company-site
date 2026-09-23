import type { MetadataRoute } from "next";
import { site } from "@/site";

export const dynamic = "force-static";

// Derived from the route list rather than hand-maintained. A sitemap typed by
// hand is a second copy of the routes, and the copy is what goes stale.
const ROUTES = ["", "/solutions", "/contact", "/privacy-policy", "/terms-of-service"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map((path) => ({
    url: `https://${site.domain}${path}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
}
