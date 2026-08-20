"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SvgMailSent } from "iblis-react-undraw";
import { ClearButton, CountRing, Cross, FieldNote, FieldToast, StatusMark } from "@/components/form-field";
import { Toast } from "@/components/toast";
import { content as t } from "@/lib/content";
import { wa, waMessages } from "@/lib/contact";
import { LIMITS, checkField, digitsOnly, sanitise, type FieldName } from "@/lib/validation";

type State = "idle" | "sending" | "submitted" | "sent" | "error";

/* Mirrors the server. Checking here too means an oversized file is refused
   before it is uploaded over a phone connection, rather than after. */
const ACCEPT = [".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg"];
const MAX_FILES = 4;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

const readableSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)}MB` : `${Math.max(1, Math.round(bytes / 1024))}KB`;

const fieldBase =
  "w-full rounded-lg border bg-white px-4 py-3 pr-20 text-[15px] text-ink outline-none transition placeholder:text-muted";

const labelText = "text-[13px] font-bold text-navy";

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`animate-spin ${className}`} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const EMPTY = { name: "", package: "", email: "", phone: "", website: "", message: "", company: "" };

export function ContactForm() {
  const c = t.contactPage;
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fieldRefs = useRef<Partial<Record<FieldName, HTMLElement | null>>>({});

  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [files, setFiles] = useState<File[]>([]);

  const set = (key: keyof typeof values, value: string) => setValues((v) => ({ ...v, [key]: value }));
  const touch = (key: FieldName) => setTouched((current) => ({ ...current, [key]: true }));

  const results: Record<FieldName, { ok: boolean; message?: string }> = {
    name: checkField("name", values.name),
    email: checkField("email", values.email),
    phone: checkField("phone", values.phone),
    package: checkField("package", values.package),
    website: checkField("website", values.website),
    message: checkField("message", values.message),
  };

  const formValid = Object.values(results).every((r) => r.ok);

  /* A field is only marked once it has been left or a send was attempted:
     flagging an address as wrong while it is still being typed is noise,
     because every address is invalid until its last character. */
  function markOf(name: FieldName, optional = false) {
    if (!touched[name]) return "none" as const;
    if (!results[name].ok) return "invalid" as const;
    if (optional && !values[name]) return "none" as const;
    return "valid" as const;
  }

  const borderOf = (name: FieldName) =>
    touched[name] && !results[name].ok ? "border-amber-500 focus:border-amber-500" : "border-border focus:border-navy";

  useEffect(() => {
    if (state !== "sent") return;
    router.prefetch("/");
    const timer = setTimeout(() => router.push("/"), 4000);
    return () => clearTimeout(timer);
  }, [state, router]);

  function addFiles(incoming: File[]) {
    const accepted: File[] = [];

    for (const file of incoming) {
      const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (!ACCEPT.includes(extension)) {
        setError(`${file.name} is not an accepted file type. Use PDF, Word, PNG or JPG.`);
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setError(`${file.name} is larger than 5MB.`);
        return;
      }
      accepted.push(file);
    }

    /* Dropping the same file twice is a slip rather than an instruction, so a
       match on name and size is ignored instead of attached again. */
    const merged = [...files];
    for (const file of accepted) {
      if (!merged.some((f) => f.name === file.name && f.size === file.size)) merged.push(file);
    }

    if (merged.length > MAX_FILES) {
      setError(c.fileTooMany);
      return;
    }

    setError("");
    if (state === "error") setState("idle");
    setFiles(merged);
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    /* Marking everything on a failed send is what turns "it will not submit"
       into a list of things to fix. */
    if (!formValid) {
      /* No form-level notice here. Every field that fails carries its own
         bubble, and a banner repeating that in the abstract is one more thing
         to read on the way to the fix. */
      setTouched({ name: true, email: true, phone: true, package: true, website: true, message: true });
      setState("idle");

      /* Take the reader to the first thing to fix rather than leaving them to
         hunt for it: the form is longer than a phone screen, and the field at
         fault is often scrolled out of sight when send is pressed. */
      const order: FieldName[] = ["name", "package", "email", "phone", "website", "message"];
      const first = order.find((field) => !results[field].ok);
      const element = first ? fieldRefs.current[first] : null;

      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        /* Focused after the scroll settles, because focusing first makes the
           browser jump there instantly and undo the smooth scroll. */
        setTimeout(() => element.focus({ preventScroll: true }), 400);
      }
      return;
    }

    setState("sending");
    setError("");
    setProgress(0);

    const data = new FormData();
    /* Sanitised on the way out as well as on arrival: what is sent should be
       what was shown, and the server repeats every check regardless. */
    Object.entries(values).forEach(([key, value]) =>
      data.append(key, sanitise(value, LIMITS[key as keyof typeof LIMITS] ?? 200))
    );
    files.forEach((file) => data.append("files", file));

    /* XHR rather than fetch: it reports upload progress, and with attachments
       of several megabytes a figure that moves is the difference between
       waiting and assuming the form is broken. */
    const request = new XMLHttpRequest();
    request.open("POST", "/api/contact");

    request.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    };

    request.onload = () => {
      let body: { error?: string } = {};
      try {
        body = JSON.parse(request.responseText);
      } catch {
        /* A response that is not JSON is a failure whatever it says. */
      }

      if (request.status >= 200 && request.status < 300) {
        /* Held for a beat so the button finishes its own sentence before the
           panel takes over, rather than the press appearing to do nothing. */
        setState("submitted");
        setTimeout(() => setState("sent"), 900);
        return;
      }

      setError(body.error || c.errorFallback);
      setState("error");
    };

    request.onerror = () => {
      /* Offline, or the request never left the device. */
      setError(c.errorFallback);
      setState("error");
    };

    request.send(data);
  }

  if (state === "sent") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rise-in flex flex-col items-center gap-5 rounded-2xl border border-border bg-white p-8 text-center md:p-10"
      >
        <div className="float-soft w-full max-w-[260px]">
          <SvgMailSent primarycolor="#f7c325" height={180} className="mx-auto h-auto w-full" />
        </div>

        <span className="pop-in flex h-14 w-14 items-center justify-center rounded-full bg-teal-600">
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden>
            <polyline
              points="20 6 9 17 4 12"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="draw-tick"
            />
          </svg>
        </span>

        <h2 className="font-display text-2xl font-bold text-navy md:text-3xl">{c.successTitle}</h2>
        <p className="max-w-lg text-[15px] leading-relaxed text-body">{c.successBody}</p>

        <Link
          href="/"
          className="btn-primary inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-sm font-bold text-navy transition-colors hover:bg-amber-600"
        >
          {c.successHome}
        </Link>
      </div>
    );
  }

  const sending = state === "sending";
  const submitted = state === "submitted";

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {/* Anything about the form as a whole surfaces here, over the page, where
          someone who has just pressed send is already looking. */}
      {error && <Toast message={error} onDismiss={() => setError("")} />}

      {/* Hidden from people, tempting to a scripted submitter. A filled one is
          answered with success and dropped on the server. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={values.company}
        onChange={(e) => set("company", e.target.value)}
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      />

      {/* Who is asking, and roughly what for. */}
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={labelText}>{c.nameLabel}</span>
          <span className="relative block">
            {touched.name && !results.name.ok && (
              <FieldToast id="error-name" message={results.name.message!} />
            )}
            <input
              type="text"
              maxLength={LIMITS.name}
              autoComplete="name"
              placeholder={c.namePlaceholder}
              aria-describedby="note-name error-name"
              aria-invalid={touched.name && !results.name.ok}
              ref={(el) => { fieldRefs.current["name"] = el; }}
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              onBlur={() => touch("name")}
              className={`${fieldBase} ${borderOf("name")}`}
            />
            <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
              {values.name && <ClearButton onClick={() => set("name", "")} title={`${c.clear} ${c.nameLabel}`} />}
              <StatusMark status={markOf("name")} />
            </span>
          </span>
          <FieldNote id="note-name" hint={c.nameHint}  />
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelText}>{c.packageLabel}</span>
          <span className="relative block">
            {touched.package && !results.package.ok && (
              <FieldToast id="error-package" message={results.package.message!} />
            )}
            <select
              ref={(el) => { fieldRefs.current["package"] = el; }}
              value={values.package}
              aria-describedby="note-package error-package"
              aria-invalid={touched.package && !results.package.ok}
              onChange={(e) => set("package", e.target.value)}
              onBlur={() => touch("package")}
              className={`${fieldBase} cursor-pointer appearance-none ${borderOf("package")} ${
                values.package ? "text-ink" : "text-muted"
              }`}
            >
              <option value="">{c.packagePlaceholder}</option>
              {t.pricing.tiers.map((tier) => (
                <option key={tier.name} value={tier.name}>
                  {tier.name}
                </option>
              ))}
              <option value={c.packageUnsure}>{c.packageUnsure}</option>
            </select>
            <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
              <svg
                viewBox="0 0 24 24"
                aria-hidden
                className="pointer-events-none h-4 w-4 text-muted"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <StatusMark status={markOf("package")} />
            </span>
          </span>
          <FieldNote id="note-package" hint={c.packageHint} error={undefined} />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={labelText}>{c.emailLabel}</span>
          <span className="relative block">
            {touched.email && !results.email.ok && (
              <FieldToast id="error-email" message={results.email.message!} />
            )}
            <input
              type="email"
              maxLength={LIMITS.email}
              autoComplete="email"
              placeholder={c.emailPlaceholder}
              aria-describedby="note-email error-email"
              aria-invalid={touched.email && !results.email.ok}
              ref={(el) => { fieldRefs.current["email"] = el; }}
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              onBlur={() => touch("email")}
              className={`${fieldBase} ${borderOf("email")}`}
            />
            <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
              {values.email && <ClearButton onClick={() => set("email", "")} title={`${c.clear} ${c.emailLabel}`} />}
              <StatusMark status={markOf("email")} />
            </span>
          </span>
          <FieldNote id="note-email" hint={c.emailHint}  />
        </label>

        {/* +60 is printed in the field rather than typed, and only digits are
            kept, so the number that arrives is always in one shape. */}
        <label className="flex flex-col gap-2">
          <span className={labelText}>{c.phoneLabel}</span>
          <span className="relative block">
            {touched.phone && !results.phone.ok && (
              <FieldToast id="error-phone" message={results.phone.message!} />
            )}
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-muted">
              {c.phonePrefix}
            </span>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={LIMITS.phone}
              placeholder={c.phonePlaceholder}
              aria-describedby="note-phone error-phone"
              aria-invalid={touched.phone && !results.phone.ok}
              ref={(el) => { fieldRefs.current["phone"] = el; }}
              value={values.phone}
              onChange={(e) => set("phone", digitsOnly(e.target.value).slice(0, LIMITS.phone))}
              onBlur={() => touch("phone")}
              className={`${fieldBase} pl-14 ${borderOf("phone")}`}
            />
            <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
              {values.phone && <ClearButton onClick={() => set("phone", "")} title={`${c.clear} ${c.phoneLabel}`} />}
              <StatusMark status={markOf("phone", true)} />
            </span>
          </span>
          <FieldNote id="note-phone" hint={c.phoneHint}  />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className={labelText}>{c.websiteLabel}</span>
        <span className="relative block">
          {touched.website && !results.website.ok && (
            <FieldToast id="error-website" message={results.website.message!} />
          )}
          <input
            type="text"
            inputMode="url"
            autoComplete="url"
            maxLength={LIMITS.website}
            placeholder={c.websitePlaceholder}
            aria-describedby="note-website error-website"
            aria-invalid={touched.website && !results.website.ok}
            ref={(el) => { fieldRefs.current["website"] = el; }}
            value={values.website}
            onChange={(e) => set("website", e.target.value)}
            onBlur={() => touch("website")}
            className={`${fieldBase} ${borderOf("website")}`}
          />
          <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {values.website && <ClearButton onClick={() => set("website", "")} title={`${c.clear} ${c.websiteLabel}`} />}
            <StatusMark status={markOf("website", true)} />
          </span>
        </span>
        <FieldNote id="note-website" hint={c.websiteHint}  />
      </label>

      <label className="flex flex-col gap-2">
        <span className="flex items-center justify-between gap-3">
          <span className={labelText}>{c.messageLabel}</span>
          <CountRing used={values.message.length} max={LIMITS.message} />
        </span>
        <span className="relative block">
          {touched.message && !results.message.ok && (
            <FieldToast id="error-message" message={results.message.message!} />
          )}
          <textarea
            rows={7}
            maxLength={LIMITS.message}
            placeholder={c.messagePlaceholder}
            aria-describedby="note-message error-message"
            aria-invalid={touched.message && !results.message.ok}
            ref={(el) => { fieldRefs.current["message"] = el; }}
            value={values.message}
            onChange={(e) => set("message", e.target.value)}
            onBlur={() => touch("message")}
            className={`${fieldBase} resize-y ${borderOf("message")}`}
          />
          <span className="absolute right-3 top-3 flex items-center gap-1">
            {values.message && (
              <ClearButton onClick={() => set("message", "")} title={`${c.clear} ${c.messageLabel}`} />
            )}
            <StatusMark status={markOf("message")} />
          </span>
        </span>
        <FieldNote id="note-message" hint={c.messageHint}  />
      </label>

      {/* The drop zone is a button rather than a div, so it is reachable by
          keyboard: a zone that only answers to a mouse leaves anyone tabbing
          through the form unable to attach anything. */}
      <div className="flex flex-col gap-2">
        <span className={labelText}>{c.filesLabel}</span>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addFiles(Array.from(e.dataTransfer.files));
          }}
          className={`flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-6 py-8 text-center transition ${
            dragging ? "border-amber-400 bg-amber-300/20" : "border-navy/20 bg-white hover:border-amber-400"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 text-muted"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden
          >
            <path d="M12 16V4m0 0 4 4m-4-4L8 8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
          </svg>
          <span className="text-[14px] font-bold text-navy">{c.dropTitle}</span>
          <span className="text-[12.5px] text-muted">{c.dropHint}</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPT.join(",")}
          onChange={(e) => {
            addFiles(Array.from(e.target.files ?? []));
            /* Cleared so choosing the same file again still fires a change. */
            e.target.value = "";
          }}
          className="hidden"
        />

        {files.length > 0 && (
          <ul className="flex flex-col gap-2">
            {files.map((file) => (
              <li
                key={`${file.name}-${file.size}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white px-3 py-2"
              >
                <span className="min-w-0 truncate text-[13px] font-medium text-navy">{file.name}</span>
                <span className="flex flex-shrink-0 items-center gap-2 text-[12.5px] text-muted">
                  {readableSize(file.size)}
                  <button
                    type="button"
                    onClick={() => setFiles((current) => current.filter((f) => f !== file))}
                    aria-label={`${c.clear} ${file.name}`}
                    title={c.clear}
                    className="flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-bg hover:text-navy"
                  >
                    <Cross />
                  </button>
                </span>
              </li>
            ))}

            <li>
              <button
                type="button"
                onClick={() => setFiles([])}
                className="text-[12.5px] font-semibold text-muted underline underline-offset-4 transition hover:text-navy"
              >
                {c.clearAll}
              </button>
            </li>
          </ul>
        )}
      </div>


      <div className="mt-1 flex flex-wrap items-center gap-4">
        {/* The button is the only place progress is reported: it is what was
            pressed, so it is where the eye already is, and one indicator cannot
            disagree with another. Submit, submitting, submitted. */}
        <button
          type="submit"
          disabled={sending || submitted}
          className="btn-primary inline-flex min-w-[168px] items-center justify-center gap-2 rounded-lg bg-amber-500 px-7 py-3.5 text-[15px] font-bold text-navy transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-80"
        >
          {sending && <Spinner className="h-4 w-4" />}
          {submitted && (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
              <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {sending ? `${c.sending}${progress > 0 && progress < 100 ? ` ${progress}%` : ""}` : submitted ? c.submitted : c.submit}
        </button>

        <span className="text-[13.5px] text-muted">
          {c.waNote}{" "}
          <a
            href={wa(waMessages.start)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-navy underline decoration-amber-500 decoration-2 underline-offset-4 hover:decoration-navy"
          >
            {c.waCta}
          </a>
        </span>
      </div>
    </form>
  );
}
