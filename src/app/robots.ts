import type { MetadataRoute } from "next";

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
          "Meta-ExternalAgent", // Meta web crawler
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
    sitemap: "https://zakrulabd.com/sitemap.xml",
  };
}

