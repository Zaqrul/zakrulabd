export const WHATSAPP_NUMBER = "60102551527";

/* Pre-filled WhatsApp messages stay in Malay — most enquiries come in Malay.
   Imported by both the page components and next.config.ts, which builds the
   branded /wa short links from the same strings. */
export const waMessages = {
  quote: "Hai Zaqrul, saya ingin mendapatkan sebut harga untuk laman web perniagaan saya. Boleh kita berbincang?",
  hero: "Hai Zaqrul, saya menemui laman web anda dan ingin berbincang tentang laman web untuk perniagaan saya.",
  starter: "Hai Zaqrul, saya berminat dengan pakej Starter Website. Boleh terangkan skopnya?",
  business: "Hai Zaqrul, saya berminat dengan pakej Professional Website. Boleh kita berbincang?",
  custom: "Hai Zaqrul, saya memerlukan sistem web tersuai untuk perniagaan saya. Boleh kita bincang skop dan sebut harga?",
  intro: "Hai Zaqrul, nama saya ___ dan perniagaan saya ___. Saya memerlukan ___.",
  start: "Hai Zaqrul, saya ingin memulakan projek. Ini keperluan saya: ___.",
};

export function wa(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
