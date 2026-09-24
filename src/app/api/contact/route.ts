import { NextResponse } from "next/server";
import { Resend } from "resend";
import { MAX_CONTACT_BODY_BYTES, MAX_CONTACT_FILES, MAX_CONTACT_FILE_BYTES, MAX_CONTACT_TOTAL_FILE_BYTES } from "@/lib/contact-limits";
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

/* The request cap is lower than the Vercel function body limit. Extension,
   claimed MIME type and file signature are checked before sending attachments. */
const ALLOWED: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};

/* A best-effort local limit protects one function instance. Platform WAF rate
   limiting is still needed because instances do not share this counter. */
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
    // A stream of fresh IPs must not grow this process-local map indefinitely.
    while (seen.size > 500) seen.delete(seen.keys().next().value!);
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
  return base.replace(/[\x00-\x1F\x7F<>:"|?*]/g, "").slice(-120) || "attachment";
}

function extensionOf(name: string) {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

function hasExpectedSignature(extension: string, bytes: Uint8Array) {
  const starts = (...signature: number[]) => signature.every((byte, index) => bytes[index] === byte);
  switch (extension) {
    case ".pdf": return starts(0x25, 0x50, 0x44, 0x46, 0x2d);
    case ".doc": return starts(0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1);
    case ".docx": return starts(0x50, 0x4b, 0x03, 0x04);
    case ".png": return starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
    case ".jpg":
    case ".jpeg": return starts(0xff, 0xd8, 0xff);
    default: return false;
  }
}

async function boundedFormData(request: Request) {
  const length = Number(request.headers.get("content-length"));
  if (Number.isFinite(length) && length > MAX_CONTACT_BODY_BYTES) return { tooLarge: true } as const;

  const reader = request.body?.getReader();
  if (!reader) return { malformed: true } as const;
  const chunks: Buffer[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_CONTACT_BODY_BYTES) {
        await reader.cancel();
        return { tooLarge: true } as const;
      }
      chunks.push(Buffer.from(value));
    }
    const body = Buffer.concat(chunks, size);
    const form = await new Request(request.url, {
      method: "POST",
      headers: { "content-type": request.headers.get("content-type")! },
      body,
    }).formData();
    return { form } as const;
  } catch {
    return { malformed: true } as const;
  } finally {
    reader.releaseLock();
  }
}

const TEXT_FIELDS = new Set(["name", "email", "phone", "package", "website", "message", "company"]);

function validFormShape(form: FormData) {
  const counts = new Map<string, number>();
  for (const [key, value] of form) {
    if (key !== "files" && (!TEXT_FIELDS.has(key) || typeof value !== "string")) return false;
    if (key === "files" && !(value instanceof File)) return false;
    const count = (counts.get(key) ?? 0) + 1;
    if (count > (key === "files" ? MAX_CONTACT_FILES : 1)) return false;
    counts.set(key, count);
  }
  return true;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (
    origin !== new URL(request.url).origin ||
    (fetchSite && fetchSite !== "same-origin") ||
    request.headers.get("x-contact-form") !== "1"
  ) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  }

  if (!/^multipart\/form-data\s*;\s*boundary=/i.test(request.headers.get("content-type") ?? "")) {
    return NextResponse.json({ error: "Expected a multipart form." }, { status: 415 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email is not configured on this deployment." }, { status: 503 });
  }

  /* Vercel overwrites X-Forwarded-For, preventing clients from choosing a new
     rate-limit key by sending their own forwarding header. */
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many messages just now. Try again shortly." }, { status: 429 });
  }

  const parsed = await boundedFormData(request);
  if ("tooLarge" in parsed) {
    return NextResponse.json({ error: "The form is larger than 4 MB." }, { status: 413 });
  }
  if ("malformed" in parsed) {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }
  const form = parsed.form;
  if (!validFormShape(form)) {
    return NextResponse.json({ error: "Malformed form fields." }, { status: 400 });
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

  if (uploads.length > MAX_CONTACT_FILES) {
    return NextResponse.json({ error: `Please attach at most ${MAX_CONTACT_FILES} files.` }, { status: 400 });
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
    if (file.size > MAX_CONTACT_FILE_BYTES) {
      return NextResponse.json({ error: `${safeName(file.name)} is larger than 3MB.` }, { status: 400 });
    }

    total += file.size;
    if (total > MAX_CONTACT_TOTAL_FILE_BYTES) {
      return NextResponse.json({ error: "The attachments come to more than 3MB in total." }, { status: 400 });
    }

    if (!hasExpectedSignature(extension, new Uint8Array(await file.slice(0, 8).arrayBuffer()))) {
      return NextResponse.json({ error: `${safeName(file.name)} does not match its file type.` }, { status: 400 });
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
