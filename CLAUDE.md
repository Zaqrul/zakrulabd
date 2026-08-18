# Project Guidelines & Preferences (zakrulabd)

## Identity & Persona
- **Developer:** Zakrul Abdul (`zakrulabd`)
- **Email:** `zakrulabd@gmail.com`
- **Location:** Selangor, Malaysia
- **Role:** Dedicated Solo Freelance Web Developer & Technical Marketer (No agency / No team wording).
- **Communication Tone:** First-person direct ("Talk with me", "Bincang dengan saya", "How I Work").

## Architecture & Code Standards
- **Framework:** Next.js (App Router, Turbopack, standalone static generation)
- **Proxy Convention:** Use `src/proxy.ts` (named export `export function proxy(request: NextRequest)`) instead of deprecated middleware.
- **Language Support:** Bilingual (`en` and `ms`) powered by `LanguageProvider` and `src/lib/dictionaries.ts`.

## UI & Design System
- **Palette:** High-contrast neutral base (navy `#171717`, background `#f5f5f5`, white `#ffffff`) with amber/yellow accent (`#fbcf33` / `#f7c325`).
- **Highlight Text:** Always use `.hl` class with dark text over amber pills.
- **Typography:** Inter (`--font-inter`) for body, Plus Jakarta Sans (`--font-jakarta`) for display/headings, JetBrains Mono (`--font-jetbrains-mono`) for code/tech tags.
- **Navigation:** Sticky header (`sticky top-0 z-50`) with mobile subnav tabs and yellow animated hover underline.
- **Scrolling:** Smooth scrolling (`scroll-behavior: smooth`, `scroll-padding-top: 5rem`).

## Security & Crawl Policies
- **Authorized Bots:** Googlebot, Bingbot, DuckDuckBot, Baiduspider, YandexBot, and search AI bots (`OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Claude-Web`).
- **Blocked Scrapers:** Aggressive training scrapers (`GPTBot`, `CCBot`, `Bytespider`, `anthropic-ai`, `ClaudeBot`, `FacebookBot`, `Scrapy`, etc.) are blocked via `robots.ts` and `src/proxy.ts` (403 Forbidden).
- **Security Headers:** Strict HSTS, X-Frame-Options SAMEORIGIN, nosniff, Referrer-Policy, Permissions-Policy, poweredByHeader disabled in `next.config.ts`.
- **Anti-Brute Force:** Rate limiter and scanner exploit path filtering in `src/proxy.ts`.
