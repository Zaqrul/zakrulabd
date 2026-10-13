import type { MetadataRoute } from "next";
import { posts } from "@/lib/posts";
import { postPaths } from "@/lib/posts-ms";
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
    alternates: {
      languages: {
        en: `${SITE_URL}`,
        ms: `${SITE_URL}/ms`,
        "x-default": `${SITE_URL}`,
      },
    },
  },
  {
    path: "/ms",
    lastModified: "2026-09-13",
    changeFrequency: "weekly" as const,
    priority: 0.9,
    alternates: {
      languages: {
        en: `${SITE_URL}`,
        ms: `${SITE_URL}/ms`,
        "x-default": `${SITE_URL}`,
      },
    },
  },
  {
    path: "/about",
    lastModified: "2026-09-13",
    changeFrequency: "monthly" as const,
    priority: 0.7,
    alternates: {
      languages: {
        en: `${SITE_URL}/about`,
        ms: `${SITE_URL}/ms/about`,
        "x-default": `${SITE_URL}/about`,
      },
    },
  },
  {
    path: "/ms/about",
    lastModified: "2026-09-13",
    changeFrequency: "monthly" as const,
    priority: 0.7,
    alternates: {
      languages: {
        en: `${SITE_URL}/about`,
        ms: `${SITE_URL}/ms/about`,
        "x-default": `${SITE_URL}/about`,
      },
    },
  },
  {
    path: "/contact",
    lastModified: "2026-09-13",
    changeFrequency: "yearly" as const,
    priority: 0.8,
    alternates: {
      languages: {
        en: `${SITE_URL}/contact`,
        ms: `${SITE_URL}/ms/contact`,
        "x-default": `${SITE_URL}/contact`,
      },
    },
  },
  {
    path: "/ms/contact",
    lastModified: "2026-09-13",
    changeFrequency: "yearly" as const,
    priority: 0.7,
    alternates: {
      languages: {
        en: `${SITE_URL}/contact`,
        ms: `${SITE_URL}/ms/contact`,
        "x-default": `${SITE_URL}/contact`,
      },
    },
  },
  {
    path: "/compare",
    lastModified: "2026-09-13",
    changeFrequency: "monthly" as const,
    priority: 0.7,
    alternates: {
      languages: {
        en: `${SITE_URL}/compare`,
        ms: `${SITE_URL}/ms/compare`,
        "x-default": `${SITE_URL}/compare`,
      },
    },
  },
  {
    path: "/ms/compare",
    lastModified: "2026-09-13",
    changeFrequency: "monthly" as const,
    priority: 0.7,
    alternates: {
      languages: {
        en: `${SITE_URL}/compare`,
        ms: `${SITE_URL}/ms/compare`,
        "x-default": `${SITE_URL}/compare`,
      },
    },
  },
  {
    path: "/notes",
    lastModified: "2026-09-13",
    changeFrequency: "monthly" as const,
    priority: 0.7,
    alternates: {
      languages: {
        en: `${SITE_URL}/notes`,
        ms: `${SITE_URL}/ms/notes`,
        "x-default": `${SITE_URL}/notes`,
      },
    },
  },
  {
    path: "/ms/notes",
    lastModified: "2026-09-13",
    changeFrequency: "monthly" as const,
    priority: 0.7,
    alternates: {
      languages: {
        en: `${SITE_URL}/notes`,
        ms: `${SITE_URL}/ms/notes`,
        "x-default": `${SITE_URL}/notes`,
      },
    },
  },
  /* One pair per article, generated so a new post cannot be left out. Each
     takes the article's own date, which is bumped when it is rewritten. */
  ...posts.flatMap((post) => {
    const paths = postPaths(post);
    const alternates = {
      languages: {
        en: `${SITE_URL}${paths.en}`,
        ms: `${SITE_URL}${paths.ms}`,
        "x-default": `${SITE_URL}${paths.en}`,
      },
    };
    return [paths.en, paths.ms].map((path) => ({
      path,
      lastModified: post.date,
      changeFrequency: "yearly" as const,
      priority: 0.6,
      alternates,
    }));
  }),
  {
    path: "/privacy",
    lastModified: "2026-09-13",
    changeFrequency: "monthly" as const,
    priority: 0.5,
    alternates: {
      languages: {
        en: `${SITE_URL}/privacy`,
        ms: `${SITE_URL}/ms/privacy`,
        "x-default": `${SITE_URL}/privacy`,
      },
    },
  },
  {
    path: "/ms/privacy",
    lastModified: "2026-09-13",
    changeFrequency: "monthly" as const,
    priority: 0.5,
    alternates: {
      languages: {
        en: `${SITE_URL}/privacy`,
        ms: `${SITE_URL}/ms/privacy`,
        "x-default": `${SITE_URL}/privacy`,
      },
    },
  },
  {
    path: "/terms",
    lastModified: "2026-09-13",
    changeFrequency: "monthly" as const,
    priority: 0.5,
    alternates: {
      languages: {
        en: `${SITE_URL}/terms`,
        ms: `${SITE_URL}/ms/terms`,
        "x-default": `${SITE_URL}/terms`,
      },
    },
  },
  {
    path: "/ms/terms",
    lastModified: "2026-09-13",
    changeFrequency: "monthly" as const,
    priority: 0.5,
    alternates: {
      languages: {
        en: `${SITE_URL}/terms`,
        ms: `${SITE_URL}/ms/terms`,
        "x-default": `${SITE_URL}/terms`,
      },
    },
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, ...rest }) => ({ url: `${SITE_URL}${path}`, ...rest }));
}
