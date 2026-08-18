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

const nextConfig: NextConfig = {
  async redirects() {
    return waShortLinks.map(({ path, message }) => ({
      source: path,
      destination: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      permanent: false,
    }));
  },
};

export default nextConfig;
