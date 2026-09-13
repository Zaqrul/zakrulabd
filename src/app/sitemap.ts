import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/* lastModified used to be new Date(), which restamped every page on every
   deploy — a deploy that only changed a colour claimed all four pages were
   rewritten. Crawlers learn to ignore a lastmod that always says "today", so
   these are fixed dates: bump the one whose copy actually changed. */
const routes = [
  {
    path: "",
    lastModified: "2026-09-13",
    changeFrequency: "weekly" as const,
    priority: 1.0,
    alternates: { languages: { en: `${SITE_URL}`, ms: `${SITE_URL}/ms` } },
  },
  {
    path: "/ms",
    lastModified: "2026-09-13",
    changeFrequency: "weekly" as const,
    priority: 0.9,
    alternates: { languages: { en: `${SITE_URL}`, ms: `${SITE_URL}/ms` } },
  },
  {
    path: "/about",
    lastModified: "2026-09-13",
    changeFrequency: "monthly" as const,
    priority: 0.7,
    alternates: { languages: { en: `${SITE_URL}/about`, ms: `${SITE_URL}/ms/about` } },
  },
  {
    path: "/ms/about",
    lastModified: "2026-09-13",
    changeFrequency: "monthly" as const,
    priority: 0.7,
    alternates: { languages: { en: `${SITE_URL}/about`, ms: `${SITE_URL}/ms/about` } },
  },
  {
    path: "/contact",
    lastModified: "2026-09-13",
    changeFrequency: "yearly" as const,
    priority: 0.8,
    alternates: { languages: { en: `${SITE_URL}/contact`, ms: `${SITE_URL}/ms/contact` } },
  },
  {
    path: "/ms/contact",
    lastModified: "2026-09-13",
    changeFrequency: "yearly" as const,
    priority: 0.7,
    alternates: { languages: { en: `${SITE_URL}/contact`, ms: `${SITE_URL}/ms/contact` } },
  },
  {
    path: "/compare",
    lastModified: "2026-09-13",
    changeFrequency: "monthly" as const,
    priority: 0.7,
    alternates: { languages: { en: `${SITE_URL}/compare`, ms: `${SITE_URL}/ms/compare` } },
  },
  {
    path: "/ms/compare",
    lastModified: "2026-09-13",
    changeFrequency: "monthly" as const,
    priority: 0.7,
    alternates: { languages: { en: `${SITE_URL}/compare`, ms: `${SITE_URL}/ms/compare` } },
  },
  {
    path: "/notes",
    lastModified: "2026-09-13",
    changeFrequency: "monthly" as const,
    priority: 0.7,
    alternates: { languages: { en: `${SITE_URL}/notes`, ms: `${SITE_URL}/ms/notes` } },
  },
  {
    path: "/ms/notes",
    lastModified: "2026-09-13",
    changeFrequency: "monthly" as const,
    priority: 0.7,
    alternates: { languages: { en: `${SITE_URL}/notes`, ms: `${SITE_URL}/ms/notes` } },
  },
  {
    path: "/notes/the-kuih-maker-who-had-no-time-to-market",
    lastModified: "2026-09-13",
    changeFrequency: "yearly" as const,
    priority: 0.6,
    alternates: {
      languages: {
        en: `${SITE_URL}/notes/the-kuih-maker-who-had-no-time-to-market`,
        ms: `${SITE_URL}/ms/notes/sri-tanduk`,
      },
    },
  },
  {
    path: "/ms/notes/sri-tanduk",
    lastModified: "2026-09-13",
    changeFrequency: "yearly" as const,
    priority: 0.6,
    alternates: {
      languages: {
        en: `${SITE_URL}/notes/the-kuih-maker-who-had-no-time-to-market`,
        ms: `${SITE_URL}/ms/notes/sri-tanduk`,
      },
    },
  },
  {
    path: "/privacy",
    lastModified: "2026-09-13",
    changeFrequency: "monthly" as const,
    priority: 0.5,
    alternates: { languages: { en: `${SITE_URL}/privacy`, ms: `${SITE_URL}/ms/privacy` } },
  },
  {
    path: "/ms/privacy",
    lastModified: "2026-09-13",
    changeFrequency: "monthly" as const,
    priority: 0.5,
    alternates: { languages: { en: `${SITE_URL}/privacy`, ms: `${SITE_URL}/ms/privacy` } },
  },
  {
    path: "/terms",
    lastModified: "2026-09-13",
    changeFrequency: "monthly" as const,
    priority: 0.5,
    alternates: { languages: { en: `${SITE_URL}/terms`, ms: `${SITE_URL}/ms/terms` } },
  },
  {
    path: "/ms/terms",
    lastModified: "2026-09-13",
    changeFrequency: "monthly" as const,
    priority: 0.5,
    alternates: { languages: { en: `${SITE_URL}/terms`, ms: `${SITE_URL}/ms/terms` } },
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, ...rest }) => ({ url: `${SITE_URL}${path}`, ...rest }));
}
