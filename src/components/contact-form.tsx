"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SvgMailSent } from "iblis-react-undraw";
import { content as t } from "@/lib/content";
import { wa, waMessages } from "@/lib/contact";

type State = "idle" | "sending" | "sent" | "error";

/* Mirrors the server. Checking here too means an oversized file is refused
   before it is uploaded over a phone connection, rather than after. */
const ACCEPT = [".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg"];
const MAX_FILES = 4;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

const readableSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)}MB` : `${Math.max(1, Math.round(bytes / 1024))}KB`;

const field =
  "w-full rounded-lg border border-border bg-white px-4 py-3 pr-10 text-[15px] text-ink outline-none transition placeholder:text-muted focus:border-navy";

const labelText = "text-[13px] font-bold text-navy";

function Cross({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

/* Every field can be emptied without selecting the text first, which matters
   most on a phone where select-all is fiddly. */
function ClearButton({ onClick, title, top = "top-1/2 -translate-y-1/2" }: { onClick: () => void; title: string; top?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={title}
      title={title}
      className={`absolute right-2.5 ${top} flex h-6 w-6 items-center justify-center rounded-full text-muted transition hover:bg-bg hover:text-navy`}
    >
      <Cross />
    </button>
  );
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`animate-spin ${className}`} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function ContactForm() {
  const c = t.contactPage;
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  const [values, setValues] = useState({ name: "", package: "", email: "", website: "", message: "", company: "" });
  const [files, setFiles] = useState<File[]>([]);

  const set = (key: keyof typeof values, value: string) => setValues((v) => ({ ...v, [key]: value }));

  /* Back to the homepage once the thanks has had time to be read. Prefetching
     first means that hop is instant rather than a blank moment. */
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
    setState("sending");
    setError("");
    setProgress(0);

    const data = new FormData();
    Object.entries(values).forEach(([key, value]) => data.append(key, value));
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
        setState("sent");
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
        {/* The drawing floats gently while the tick strokes itself on, so the
            few seconds before the redirect are not a frozen screen. */}
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

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
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
            <input
              type="text"
              required
              maxLength={100}
              autoComplete="name"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              className={field}
            />
            {values.name && <ClearButton onClick={() => set("name", "")} title={`${c.clear} ${c.nameLabel}`} />}
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelText}>{c.packageLabel}</span>
          <span className="relative block">
            <select
              value={values.package}
              onChange={(e) => set("package", e.target.value)}
              className={`${field} cursor-pointer appearance-none`}
            >
              <option value="">{c.packagePlaceholder}</option>
              {t.pricing.tiers.map((tier) => (
                <option key={tier.name} value={tier.name}>
                  {tier.name}
                </option>
              ))}
            </select>
            {values.package ? (
              <ClearButton onClick={() => set("package", "")} title={`${c.clear} ${c.packageLabel}`} />
            ) : (
              <svg
                viewBox="0 0 24 24"
                aria-hidden
                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={labelText}>{c.emailLabel}</span>
          <span className="relative block">
            <input
              type="email"
              required
              maxLength={200}
              autoComplete="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              className={field}
            />
            {values.email && <ClearButton onClick={() => set("email", "")} title={`${c.clear} ${c.emailLabel}`} />}
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelText}>{c.websiteLabel}</span>
          <span className="relative block">
            <input
              type="url"
              maxLength={200}
              inputMode="url"
              autoComplete="url"
              placeholder={c.websitePlaceholder}
              value={values.website}
              onChange={(e) => set("website", e.target.value)}
              className={field}
            />
            {values.website && <ClearButton onClick={() => set("website", "")} title={`${c.clear} ${c.websiteLabel}`} />}
          </span>
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className={labelText}>{c.messageLabel}</span>
        <span className="relative block">
          <textarea
            required
            rows={7}
            maxLength={4000}
            placeholder={c.messagePlaceholder}
            value={values.message}
            onChange={(e) => set("message", e.target.value)}
            className={`${field} resize-y`}
          />
          {values.message && (
            <ClearButton onClick={() => set("message", "")} title={`${c.clear} ${c.messageLabel}`} top="top-3" />
          )}
        </span>
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
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
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

      {state === "error" && (
        <p role="alert" className="border-l-[3px] border-amber-500 bg-amber-300/20 px-4 py-3 text-[14px] text-body">
          {error}
        </p>
      )}

      {/* The bar carries the real upload figure rather than an indeterminate
          animation, so a large attachment reads as progress, not a stall. */}
      {sending && (
        <div className="flex items-center gap-3" aria-live="polite">
          <Spinner className="h-5 w-5 flex-shrink-0 text-navy" />
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
            <span
              className="block h-full rounded-full bg-amber-500 transition-all duration-200"
              style={{ width: `${Math.max(progress, 6)}%` }}
            />
          </span>
          <span className="w-28 flex-shrink-0 text-right text-[12.5px] font-semibold text-muted">
            {progress < 100 ? `${c.uploading} ${progress}%` : c.sending}
          </span>
        </div>
      )}

      <div className="mt-1 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={sending}
          className="btn-primary inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-7 py-3.5 text-[15px] font-bold text-navy transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {sending && <Spinner className="h-4 w-4" />}
          {sending ? c.sending : c.submit}
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
