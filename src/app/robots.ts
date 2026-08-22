import type { MetadataRoute } from "next";
import { url } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 1. Explicitly allow legitimate search engines and permitted AI search bots
      {
        userAgent: [
          "Googlebot",
          "Bingbot",
          "DuckDuckBot",
          "Slurp",
          "Baiduspider",
          "YandexBot",
          "OAI-SearchBot", // OpenAI search indexing for ChatGPT search
          "ChatGPT-User",  // Real-time user browsing in ChatGPT
          "PerplexityBot", // Perplexity AI search and citation bot
          "Claude-Web",    // Claude real-time citation browsing
        ],
        allow: "/",
      },
      // 1b. Link-preview crawlers — what builds the card when a link is shared.
      // facebookexternalhit is not FacebookBot: the first draws previews for
      // Facebook, Instagram and WhatsApp, the second harvests training data,
      // and only the second is refused below.
      {
        userAgent: [
          "facebookexternalhit",
          // Meta indexes with this one for Threads previews as well as for
          // training. The two cannot be separated, so it is allowed.
          "meta-externalagent",
          "meta-externalfetcher",
          "WhatsApp",
          "Twitterbot",
          "LinkedInBot",
          "Slackbot",
          "Slackbot-LinkExpanding",
          "Discordbot",
          "TelegramBot",
          "Pinterest",
          "redditbot",
          "Applebot",
          "SkypeUriPreview",
          "Embedly",
          "Iframely",
          "vkShare",
        ],
        allow: "/",
      },
      // 2. Disallow aggressive AI training data scrapers and bulk harvesters
      {
        userAgent: [
          "GPTBot",             // OpenAI model training scraper
          "ClaudeBot",          // Anthropic model training scraper
          "anthropic-ai",       // Anthropic legacy crawler
          "CCBot",              // Common Crawl dataset scraper
          "Google-Extended",    // Google Gemini AI training crawler
          "Bytespider",         // ByteDance / TikTok aggressive scraper
          "FacebookBot",        // Meta AI training crawler
          "cohere-ai",          // Cohere training scraper
          "Diffbot",            // Diffbot scraper
          "Omgilibot",          // Web scraper
          "Omgili",             // Web scraper
          "ImagesiftBot",       // Image scraper
          "Scrapy",             // Python scraping framework
          "Amazonbot",          // Amazon training scraper
        ],
        disallow: ["/"],
      },
      // 3. Default fallback rule
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: url("/sitemap.xml"),
  };
}

