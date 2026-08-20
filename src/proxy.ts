import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Legitimate search engine bots and allowed AI search/citation agents
 */
const ALLOWED_BOT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /duckduckbot/i,
  /slurp/i,
  /baiduspider/i,
  /yandexbot/i,
  /sogou/i,
  /oai-searchbot/i,   // OpenAI search engine crawler for ChatGPT search
  /chatgpt-user/i,     // ChatGPT live user browsing
  /perplexitybot/i,   // Perplexity AI search and citations
  /claude-web/i,       // Claude web lookup for user citations
];

/**
 * Unauthorized / aggressive AI training scrapers, mass content harvesters, and scraping tools
 */
const BLOCKED_BOT_PATTERNS = [
  /gptbot/i,
  /claudebot/i,
  /anthropic-ai/i,
  /ccbot/i,
  /google-extended/i,
  /bytespider/i,
  /facebookbot/i,
  /meta-externalagent/i,
  /cohere-ai/i,
  /diffbot/i,
  /omgilibot/i,
  /omgili/i,
  /imagesiftbot/i,
  /amazonbot/i,
  /scrapy/i,
  /headlesschrome/i,
  /phantomjs/i,
  /selenium/i,
  /puppeteer/i,
  /python-requests/i,
  /aiohttp/i,
  /httpx/i,
  /libwww-perl/i,
  /wget/i,
  /curl\//i,
];

/**
 * Common vulnerability probe paths used by automated scanners & brute-force bots
 */
const BLOCKED_SCANNER_PATHS = [
  /^\/wp-login\.php/i,
  /^\/wp-admin/i,
  /^\/xmlrpc\.php/i,
  /^\/\.env/i,
  /^\/\.git/i,
  /^\/phpmyadmin/i,
  /^\/pma/i,
  /^\/admin\.php/i,
  /^\/config\.json/i,
  /^\/actuator/i,
  /^\/cgi-bin/i,
  /^\/eval-stdin\.php/i,
  /^\/solr/i,
  /^\/vendor\//i,
];

/**
 * In-memory sliding window rate limiter for brute-force & DDoS mitigation
 */
const ipRequestHistory = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 80;     // Max 80 requests per minute per IP

// Clean up stale entries every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    lastCleanup = now;
    for (const [key, timestamps] of ipRequestHistory.entries()) {
      const active = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
      if (active.length === 0) {
        ipRequestHistory.delete(key);
      } else {
        ipRequestHistory.set(key, active);
      }
    }
  }

  const timestamps = (ipRequestHistory.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  timestamps.push(now);
  ipRequestHistory.set(ip, timestamps);
  return false;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const userAgent = request.headers.get("user-agent") || "";
  /* cf-connecting-ip first: while a hostname is proxied through Cloudflare it
     is the only header guaranteed to hold the visitor's own address, so the
     rate limiter counts visitors rather than a handful of Cloudflare edges.
     It is simply absent when the record is DNS-only, and the usual forwarding
     headers take over. */
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  // 1. Instantly block brute-force scanners targeting sensitive backend paths
  if (BLOCKED_SCANNER_PATHS.some((pattern) => pattern.test(pathname))) {
    return new NextResponse("Forbidden: Access Denied", {
      status: 403,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // 2. Block malicious injection strings in search queries (XSS, Path Traversal, SQLi)
  if (
    search &&
    (/(\.\.\/|\.\.\\)/.test(search) ||
      /<script/i.test(search) ||
      /union(\s+all)?\s+select/i.test(search) ||
      /%00/i.test(search))
  ) {
    return new NextResponse("Bad Request: Malformed Query", {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // 3. Bot filtering: Allow legitimate search & permitted AI search bots, block scraper/training bots
  const isAllowedBot = ALLOWED_BOT_PATTERNS.some((pattern) => pattern.test(userAgent));

  if (!isAllowedBot) {
    const isBlockedBot = BLOCKED_BOT_PATTERNS.some((pattern) =>
      pattern.test(userAgent)
    );
    if (isBlockedBot) {
      return new NextResponse(
        "Forbidden: Automated scraping / AI model harvesting is restricted on this domain.",
        {
          status: 403,
          headers: { "Content-Type": "text/plain" },
        }
      );
    }
  }

  // 4. Rate limiting to prevent brute force & request flooding (skip static assets)
  const isStaticFile =
    pathname.startsWith("/_next") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico");

  if (!isStaticFile && isRateLimited(ip)) {
    return new NextResponse("Too Many Requests: Rate limit exceeded. Please try again in a minute.", {
      status: 429,
      headers: {
        "Content-Type": "text/plain",
        "Retry-After": "60",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files & images
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
