import { NextResponse } from "next/server";
import { Resend } from "resend";
import { LIMITS, checkField, digitsOnly, sanitise, singleLine } from "@/lib/validation";

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

/* Attachments. The per-file and total caps sit well under Resend's own 40MB
   message limit, because a mailbox that rejects a 30MB email loses the enquiry
   with it. Both the MIME type and the extension have to be allowed: a browser
   reports type from the extension anyway, and checking one alone lets a
   renamed executable through on the strength of a claimed type. */
const MAX_FILES = 4;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_BYTES = 12 * 1024 * 1024;

const ALLOWED: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};

/* A send costs money and inbox attention, so one address gets a handful per
   window. In memory on purpose: a counter that resets when an instance recycles
   is a fair trade against adding a database to a contact form. The proxy rate
   limits the site as a whole; this is the narrower limit for the one route that
   sends mail. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const seen = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const hits = (seen.get(ip) ?? []).filter((at) => now - at < WINDOW_MS);
  hits.push(now);
  seen.set(ip, hits);

  /* Swept occasionally so the map cannot grow without bound. */
  if (seen.size > 500) {
    for (const [key, times] of seen) {
      if (times.every((at) => now - at >= WINDOW_MS)) seen.delete(key);
    }
  }

  return hits.length > MAX_PER_WINDOW;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);

/* Whatever the sender named the file, it arrives as something predictable:
   directory separators and awkward characters stripped, and a length a mail
   client will show in full. */
function safeName(name: string) {
  const base = name.split(/[\\/]/).pop() || "attachment";
  return base.replace(/[<>:"|?*]/g, "").slice(-120) || "attachment";
}

function extensionOf(name: string) {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email is not configured on this deployment." }, { status: 503 });
  }

  /* cf-connecting-ip first for the same reason the proxy prefers it: while a
     hostname is proxied through Cloudflare it is the only header that carries
     the visitor's own address. */
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many messages just now. Try again shortly." }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  /* Honeypot: a field hidden from people and irresistible to simple bots. A
     filled one is answered with success so the bot has no signal to tune
     against, and nothing is sent. */
  if (sanitise(form.get("company"), 100)) return NextResponse.json({ ok: true });

  /* Sanitised first, then validated, so the checks run against exactly what
     would be sent rather than against what arrived. singleLine on everything
     that reaches a header: a newline there lets an attacker append headers of
     their own, Bcc included. */
  const name = singleLine(sanitise(form.get("name"), LIMITS.name));
  const email = singleLine(sanitise(form.get("email"), LIMITS.email));
  const phone = digitsOnly(sanitise(form.get("phone"), LIMITS.phone));
  const chosenPackage = singleLine(sanitise(form.get("package"), LIMITS.package));
  const website = singleLine(sanitise(form.get("website"), LIMITS.website));
  const message = sanitise(form.get("message"), LIMITS.message);

  for (const [field, value] of [
    ["name", name],
    ["email", email],
    ["phone", phone],
    ["package", chosenPackage],
    ["website", website],
    ["message", message],
  ] as const) {
    const result = checkField(field, value);
    if (!result.ok) return NextResponse.json({ error: result.message }, { status: 400 });
  }

  const uploads = form.getAll("files").filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (uploads.length > MAX_FILES) {
    return NextResponse.json({ error: `Please attach at most ${MAX_FILES} files.` }, { status: 400 });
  }

  const attachments: { filename: string; content: Buffer }[] = [];
  let total = 0;

  for (const file of uploads) {
    const extension = extensionOf(file.name);
    const allowedExtensions = ALLOWED[file.type];

    if (!allowedExtensions || !allowedExtensions.includes(extension)) {
      return NextResponse.json(
        { error: `${safeName(file.name)} is not an accepted file type. Use PDF, Word, PNG or JPG.` },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: `${safeName(file.name)} is larger than 5MB.` }, { status: 400 });
    }

    total += file.size;
    if (total > MAX_TOTAL_BYTES) {
      return NextResponse.json({ error: "The attachments come to more than 12MB in total." }, { status: 400 });
    }

    attachments.push({ filename: safeName(file.name), content: Buffer.from(await file.arrayBuffer()) });
  }

  /* Read on a phone between other work, so it leads with the line that decides
     what happens next, then the details as labelled rows, then the brief. Every
     value is escaped: the body is written by whoever filled the form and lands
     in a client that renders markup. */
  const rows: [string, string][] = [
    ["Name", name],
    ["Package", chosenPackage],
    ["Email", email],
    ["Phone", `+60${phone}`],
    ...(website ? ([["Website", website]] as [string, string][]) : []),
    ...(attachments.length
      ? ([["Attachments", attachments.map((a) => a.filename).join(", ")]] as [string, string][])
      : []),
  ];

  const text = [
    `New enquiry from ${name} — ${chosenPackage}`,
    "",
    ...rows.map(([key, value]) => `${key}: ${value}`),
    "",
    "Brief:",
    message,
    "",
    `Reply to this email and it goes straight to ${email}.`,
  ].join("\n");

  const row = ([key, value]: [string, string]) =>
    `<tr><td style="padding:12px 24px;border-bottom:1px solid #e5e5e5;color:#767676;font-size:12px;width:110px;vertical-align:top">${escapeHtml(key)}</td><td style="padding:12px 24px 12px 0;border-bottom:1px solid #e5e5e5;color:#171717;font-size:14px;font-weight:600">${escapeHtml(value)}</td></tr>`;

  const html = [
    `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f5f5f5;padding:24px">`,
    `<div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e5e5">`,
    `<div style="background:#171717;padding:20px 24px">`,
    `<p style="margin:0;color:#fbcf33;font-size:11px;font-weight:700;letter-spacing:2px">NEW ENQUIRY</p>`,
    `<p style="margin:6px 0 0;color:#ffffff;font-size:20px;font-weight:700">${escapeHtml(name)}</p>`,
    `<p style="margin:4px 0 0;color:#d4d4d4;font-size:14px">${escapeHtml(chosenPackage)}</p>`,
    `</div>`,
    `<table style="width:100%;border-collapse:collapse">${rows.map(row).join("")}</table>`,
    `<div style="padding:20px 24px">`,
    `<p style="margin:0 0 8px;color:#767676;font-size:12px;letter-spacing:1px">BRIEF</p>`,
    `<p style="margin:0;color:#171717;font-size:15px;line-height:1.6;white-space:pre-wrap">${escapeHtml(message)}</p>`,
    `</div>`,
    `<div style="padding:16px 24px;background:#f5f5f5;border-top:1px solid #e5e5e5">`,
    `<p style="margin:0;color:#525252;font-size:12px">Reply to this email and it goes straight to ${escapeHtml(email)}.</p>`,
    `</div></div></div>`,
  ].join("");

  try {
    const { error } = await client().emails.send({
      from: FROM,
      to: TO,
      /* Reply goes to the visitor, so answering is one keystroke in Gmail
         rather than a copy-paste out of the message body. */
      replyTo: email,
      subject: `New enquiry from ${name}${chosenPackage ? ` — ${chosenPackage}` : ""}`,
      text,
      html,
      ...(attachments.length ? { attachments } : {}),
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
