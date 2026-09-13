/* One set of rules for the enquiry form, imported by the field UI and by the
   route that receives it. Written once so the browser and the server can never
   disagree about what is acceptable: client-side checks are a courtesy to the
   person filling the form, and the server repeats every one of them because a
   request can arrive without a browser being involved at all. */

export const LIMITS = {
  name: 80,
  email: 160,
  phone: 10,
  package: 60,
  website: 200,
  message: 180,
} as const;

/* Strips the characters that have no business in a form field: C0 and C1
   controls, zero-width and bidirectional marks. The bidi marks matter because
   they can reorder how text is displayed without changing what it contains,
   which is how a message is made to read one way and mean another. */
export function sanitise(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value
    .normalize("NFC")
     
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\uFEFF]/g, "")
    .trim()
    .slice(0, max);
}

/* Header injection: a newline in a field that ends up in a mail header lets an
   attacker append headers of their own, Bcc included. Everything that reaches a
   header is collapsed to a single line before it gets there. */
export const singleLine = (value: string) => value.replace(/[\r\n]+/g, " ").trim();

/* Deliberately loose. Rejecting a real address because it uses an unusual TLD
   costs an enquiry; a fake one costs a deleted email. */
export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

/* Malaysian numbers without the country code: 9 digits for landlines and older
   mobiles, 10 for most mobiles. The leading zero is dropped because +60 already
   stands in for it, and a number kept as digits alone cannot smuggle anything. */
export const digitsOnly = (value: string) => value.replace(/\D/g, "");
export const isPhone = (value: string) => /^[1-9]\d{7,9}$/.test(value);

/* http and https only. A field that accepts any scheme accepts javascript: and
   data:, which are only ever useful to someone building a trap for whoever
   reads the message later. */
export function isWebsite(value: string) {
  if (!value) return true;
  try {
    const parsed = new URL(value.includes("://") ? value : `https://${value}`);
    return (parsed.protocol === "http:" || parsed.protocol === "https:") && parsed.hostname.includes(".");
  } catch {
    return false;
  }
}

export type FieldName = "name" | "email" | "phone" | "package" | "website" | "message";

/* Whether a value is acceptable, and if not, why. The message is written for
   the person who has to fix it, so it says what to do rather than what failed. */
export function checkField(name: FieldName, value: string, locale: "en" | "ms" = "en"): { ok: boolean; message?: string } {
  const message = (en: string, ms: string) => locale === "ms" ? ms : en;
  switch (name) {
    case "name":
      if (!value) return { ok: false, message: message("Tell me who I am replying to.", "Masukkan nama supaya saya tahu siapa yang perlu dibalas.") };
      if (value.length < 2) return { ok: false, message: message("That looks too short to be a name.", "Nama ini terlalu pendek.") };
      return { ok: true };

    case "email":
      if (!value) return { ok: false, message: message("I need an address to reply to.", "Masukkan alamat e-mel untuk saya membalas.") };
      if (!isEmail(value)) return { ok: false, message: message("Check the address, it is missing an @ or a domain.", "Semak alamat e-mel. Pastikan ada @ dan nama domain.") };
      return { ok: true };

    case "phone":
      if (!value) return { ok: false, message: message("I need a number I can reach you on.", "Masukkan nombor telefon yang boleh dihubungi.") };
      if (!isPhone(value))
        return { ok: false, message: message("Enter the number without the leading 0, for example 123456789.", "Masukkan nombor tanpa angka 0 di hadapan, contohnya 123456789.") };
      return { ok: true };

    case "package":
      if (!value) return { ok: false, message: message("Pick the package closest to what you need.", "Pilih pakej yang paling hampir dengan keperluan anda.") };
      return { ok: true };

    case "website":
      if (!value) return { ok: true };
      if (!isWebsite(value)) return { ok: false, message: message("Use a full address, such as example.com.", "Masukkan alamat penuh, contohnya perniagaan.com.") };
      return { ok: true };

    case "message":
      if (!value) return { ok: false, message: message("Tell me what you want built.", "Terangkan perkara yang ingin anda bina.") };
      if (value.length < 20) return { ok: false, message: message("One more sentence would help me quote it properly.", "Tambah sedikit penerangan supaya saya dapat menyediakan sebut harga yang tepat.") };
      return { ok: true };
  }
}
