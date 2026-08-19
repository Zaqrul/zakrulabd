export const WHATSAPP_NUMBER = "60102551527";

/* Pre-filled WhatsApp messages stay in Malay — most enquiries come in Malay.
   Imported by both the page components and next.config.ts, which builds the
   branded /wa short links from the same strings. */
export const waMessages = {
  quote: "Hi Zakrul! Saya nak dapatkan sebut harga percuma untuk website. Boleh kita bincang?",
  hero: "Hi Zakrul! Saya jumpa website anda dan berminat nak buat website untuk bisnes saya.",
  starter: "Hi Zakrul! Saya berminat dengan pakej Starter Website. Boleh terangkan lanjut?",
  business: "Hi Zakrul! Saya berminat dengan pakej Professional Website. Boleh kita bincang?",
  custom: "Hi Zakrul! Saya perlukan sistem web custom untuk bisnes saya. Boleh kita bincang skop dan sebut harga?",
  intro: "Hi Zakrul! Nama saya ___, bisnes saya ___. Saya nak buat: ___",
  start: "Hi Zakrul! Saya nak mulakan projek. Ini yang saya perlukan: ___",
};

export function wa(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
