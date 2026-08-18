import type { NextConfig } from "next";

const WHATSAPP_NUMBER = "60102551527";

/** Branded short links -> WhatsApp with a pre-filled message. */
const waShortLinks: { path: string; message: string }[] = [
  {
    path: "/wa",
    message: "Hi Zakru! Saya nak dapatkan free quote untuk website. Boleh kita bincang?",
  },
  {
    path: "/wa/starter",
    message: "Hi Zakru! Saya berminat dengan pakej Starter Website (RM750). Boleh terangkan lanjut?",
  },
  {
    path: "/wa/business",
    message: "Hi Zakru! Saya berminat dengan pakej Professional Website (RM3,500). Boleh kita bincang?",
  },
  {
    path: "/wa/custom",
    message: "Hi Zakru! Saya perlukan sistem/website custom untuk business saya. Boleh kita bincang scope dan quote?",
  },
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

