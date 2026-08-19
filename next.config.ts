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
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return waShortLinks.map(({ path, message }) => ({
      source: path,
      destination: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      permanent: false,
    }));
  },
};

export default nextConfig;

