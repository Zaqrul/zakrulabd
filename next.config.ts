import type { NextConfig } from "next";
import { WHATSAPP_NUMBER, waMessages } from "./src/lib/contact";

/** Branded short links -> WhatsApp, using the same messages as the site itself. */
const waShortLinks: { path: string; message: string }[] = [
  { path: "/wa", message: waMessages.quote },
  { path: "/wa/starter", message: waMessages.starter },
  { path: "/wa/business", message: waMessages.business },
  { path: "/wa/custom", message: waMessages.custom },
];

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "X-Permitted-Cross-Domain-Policies",
    value: "none",
  },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self'",
  },
];

/* Content-Security-Policy, written out per directive so each origin says why it
   is here. Reported, not enforced, on the first pass: Report-Only lets the
   console show what a real policy would have blocked without breaking the chat
   widget or analytics for a visitor. Swap the header name to
   "Content-Security-Policy" once the console stays quiet.
   'unsafe-inline' is unavoidable for scripts here: the JSON-LD block and the
   gtag bootstrap are inline, and a nonce cannot be minted for a page that is
   prerendered to static HTML at build time. */
const csp = [
  "default-src 'self'",
  // googletagmanager: gtag.js. tawk.to: the chat widget loads its own bundles.
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://*.tawk.to",
  "style-src 'self' 'unsafe-inline' https://*.tawk.to",
  "img-src 'self' data: blob: https://www.googletagmanager.com https://*.google-analytics.com https://*.tawk.to",
  "font-src 'self' data: https://*.tawk.to",
  // GA4 beacons, Tawk's websocket for live messages, Vercel Speed Insights.
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.tawk.to wss://*.tawk.to https://vitals.vercel-insights.com",
  "frame-src 'self' https://*.tawk.to",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

securityHeaders.push({ key: "Content-Security-Policy-Report-Only", value: csp });

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      ...waShortLinks.map(({ path, message }) => ({
        source: path,
        destination: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
        permanent: false,
      })),

      /* Addresses that were live for part of a day, before the section was
         renamed to /notes and slugs became the headline. A link already sent to
         someone in WhatsApp does not get a second chance, so these keep working
         and pass their ranking on rather than dead-ending on a 404. */
      { source: "/blog", destination: "/notes", permanent: true },
      {
        source: "/blog/sri-tanduk-kuih-website",
        destination: "/notes/the-kuih-maker-who-had-no-time-to-market",
        permanent: true,
      },
      {
        source: "/notes/sri-tanduk-kuih-website",
        destination: "/notes/the-kuih-maker-who-had-no-time-to-market",
        permanent: true,
      },
      { source: "/blog/:slug", destination: "/notes/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
