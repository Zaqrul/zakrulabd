import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { postSlug, posts } from "@/lib/posts";

/* lastModified used to be new Date(), which restamped every page on every
   deploy — a deploy that only changed a colour claimed all four pages were
   rewritten. Crawlers learn to ignore a lastmod that always says "today", so
   these are fixed dates: bump the one whose copy actually changed. */
const routes = [
  { path: "", lastModified: "2026-08-20", changeFrequency: "weekly" as const, priority: 1.0 },
  { path: "/compare", lastModified: "2026-08-20", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/notes", lastModified: "2026-08-20", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/contact", lastModified: "2026-08-20", changeFrequency: "yearly" as const, priority: 0.8 },
  { path: "/privacy", lastModified: "2026-08-20", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/terms", lastModified: "2026-08-20", changeFrequency: "monthly" as const, priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  /* Articles carry their own publication date, so unlike the fixed pages above
     their lastmod is true without anyone remembering to update it. */
  const articles = posts.map((post) => ({
    url: `${SITE_URL}/notes/${postSlug(post)}`,
    lastModified: post.date,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...routes.map(({ path, ...rest }) => ({ url: `${SITE_URL}${path}`, ...rest })), ...articles];
}
