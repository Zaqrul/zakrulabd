import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/* lastModified used to be new Date(), which restamped every page on every
   deploy — a deploy that only changed a colour claimed all four pages were
   rewritten. Crawlers learn to ignore a lastmod that always says "today", so
   these are fixed dates: bump the one whose copy actually changed. */
const routes = [
  { path: "", lastModified: "2026-08-20", changeFrequency: "weekly" as const, priority: 1.0 },
  { path: "/compare", lastModified: "2026-08-20", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/privacy", lastModified: "2026-08-20", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/terms", lastModified: "2026-08-20", changeFrequency: "monthly" as const, priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, ...rest }) => ({ url: `${SITE_URL}${path}`, ...rest }));
}
