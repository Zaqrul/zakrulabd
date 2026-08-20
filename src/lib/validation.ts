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

export type FieldName = "name" | "email" | "phone" | "website" | "message";

/* Whether a value is acceptable, and if not, why. The message is written for
   the person who has to fix it, so it says what to do rather than what failed. */
export function checkField(name: FieldName, value: string): { ok: boolean; message?: string } {
  switch (name) {
    case "name":
      if (!value) return { ok: false, message: "Tell me who I am replying to." };
      if (value.length < 2) return { ok: false, message: "That looks too short to be a name." };
      return { ok: true };

    case "email":
      if (!value) return { ok: false, message: "I need an address to reply to." };
      if (!isEmail(value)) return { ok: false, message: "Check the address, it is missing an @ or a domain." };
      return { ok: true };

    case "phone":
      if (!value) return { ok: false, message: "I need a number I can reach you on." };
      if (!isPhone(value))
        return { ok: false, message: "Enter the number without the leading 0, for example 123456789." };
      return { ok: true };

    case "website":
      if (!value) return { ok: true };
      if (!isWebsite(value)) return { ok: false, message: "Use a full address, such as example.com." };
      return { ok: true };

    case "message":
      if (!value) return { ok: false, message: "Tell me what you want built." };
      if (value.length < 20) return { ok: false, message: "One more sentence would help me quote it properly." };
      return { ok: true };
  }
}
