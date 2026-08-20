import { NextResponse } from "next/server";
import { Resend } from "resend";

/* Constructed per request rather than at module scope: the Resend client throws
   when the key is absent, and at module scope that turns a missing environment
   variable into a failed build instead of one route answering 503.
   The key is read on the server only. A NEXT_PUBLIC_ name would ship it in the
   browser bundle and let anyone send mail signed as this domain. */
function client() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = "zakrul.com <support@zakrul.com>";
const TO = "zakrulabd@gmail.com";

/* Caps rather than a schema library: this form has four fields and the point is
   to reject anything absurd before it reaches the mail API, not to validate
   deeply. Length limits also keep a flood of junk from filling the inbox. */
const LIMITS = { name: 100, email: 200, business: 120, message: 4000 };

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/* Deliberately loose. Rejecting a real address because it uses an unusual TLD
   costs an enquiry; a fake one costs a deleted email. */
const looksLikeEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email is not configured on this deployment." }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  /* Honeypot: a field hidden from people and irresistible to simple bots. A
     filled one is answered with success so the bot has no signal to tune
     against, and nothing is sent. */
  if (clean(body.company, 100)) return NextResponse.json({ ok: true });

  const name = clean(body.name, LIMITS.name);
  const email = clean(body.email, LIMITS.email);
  const business = clean(body.business, LIMITS.business);
  const message = clean(body.message, LIMITS.message);

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email and message are all required." }, { status: 400 });
  }
  if (!looksLikeEmail(email)) {
    return NextResponse.json({ error: "That email address does not look right." }, { status: 400 });
  }

  const lines = [
    `Name: ${name}`,
    `Email: ${email}`,
    business ? `Business: ${business}` : null,
    "",
    message,
  ].filter((line) => line !== null);

  try {
    const { error } = await client().emails.send({
      from: FROM,
      to: TO,
      /* Reply goes to the visitor, so answering is one keystroke in Gmail
         rather than a copy-paste out of the message body. */
      replyTo: email,
      subject: `New enquiry from ${name}${business ? ` (${business})` : ""}`,
      text: lines.join("\n"),
      html: lines.map((line) => (line ? `<p>${escapeHtml(line)}</p>` : "<br />")).join(""),
    });

    if (error) {
      console.error("Resend rejected the message", error);
      return NextResponse.json({ error: "The message could not be sent. Try WhatsApp instead." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form failed", err);
    return NextResponse.json({ error: "The message could not be sent. Try WhatsApp instead." }, { status: 500 });
  }
}
