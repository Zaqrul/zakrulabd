"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SvgMailSent } from "iblis-react-undraw";
import { content as t } from "@/lib/content";
import { wa, waMessages } from "@/lib/contact";

type State = "idle" | "sending" | "sent" | "error";

/* Mirrors the server. Checking here too means an oversized file is refused
   before it is uploaded over a phone connection, rather than after. */
const ACCEPT = ".pdf,.doc,.docx,.png,.jpg,.jpeg";
const MAX_FILES = 4;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

const readableSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)}MB` : `${Math.max(1, Math.round(bytes / 1024))}KB`;

const field =
  "w-full rounded-lg border border-border bg-white px-4 py-3 text-[15px] text-ink outline-none transition placeholder:text-muted focus:border-navy";

export function ContactForm() {
  const c = t.contactPage;
  const router = useRouter();
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  /* Back to the homepage once the thanks has had time to be read. Prefetching
     first means that hop is instant rather than a blank moment. */
  useEffect(() => {
    if (state !== "sent") return;
    router.prefetch("/");
    const timer = setTimeout(() => router.push("/"), 4000);
    return () => clearTimeout(timer);
  }, [state, router]);

  function onFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(event.target.files ?? []);

    if (chosen.length > MAX_FILES) {
      setError(c.fileTooMany);
      event.target.value = "";
      setFiles([]);
      return;
    }

    const tooBig = chosen.find((file) => file.size > MAX_FILE_BYTES);
    if (tooBig) {
      setError(`${tooBig.name} is larger than 5MB.`);
      event.target.value = "";
      setFiles([]);
      return;
    }

    setError("");
    if (state === "error") setState("idle");
    setFiles(chosen);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setError("");

    /* FormData rather than JSON: attachments go up as binary instead of being
       inflated by a third as base64, and the browser sets the boundary. */
    const data = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/contact", { method: "POST", body: data });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(body.error || c.errorFallback);
        setState("error");
        return;
      }

      setState("sent");
    } catch {
      /* Offline, or the request never left the device. */
      setError(c.errorFallback);
      setState("error");
    }
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

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {/* Hidden from people, tempting to a scripted submitter. A filled one is
          dropped on the server. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      />

      <label className="flex flex-col gap-2">
        <span className="text-[13px] font-bold text-navy">{c.nameLabel}</span>
        <input name="name" type="text" required maxLength={100} autoComplete="name" className={field} />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[13px] font-bold text-navy">{c.emailLabel}</span>
        <input name="email" type="email" required maxLength={200} autoComplete="email" className={field} />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[13px] font-bold text-navy">{c.businessLabel}</span>
        <input name="business" type="text" maxLength={120} autoComplete="organization" className={field} />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[13px] font-bold text-navy">{c.messageLabel}</span>
        <textarea
          name="message"
          required
          rows={6}
          maxLength={4000}
          placeholder={c.messagePlaceholder}
          className={`${field} resize-y`}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[13px] font-bold text-navy">{c.filesLabel}</span>
        <input
          type="file"
          name="files"
          multiple
          accept={ACCEPT}
          onChange={onFilesChange}
          className="w-full cursor-pointer rounded-lg border border-dashed border-navy/25 bg-white px-4 py-3 text-[14px] text-body outline-none transition file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-2 file:text-[13px] file:font-bold file:text-white hover:border-amber-400 focus:border-navy"
        />
        <span className="text-[12.5px] text-muted">{c.filesHint}</span>

        {files.length > 0 && (
          <ul className="mt-1 flex flex-col gap-1.5">
            {files.map((file) => (
              <li key={file.name} className="flex items-center justify-between gap-3 text-[12.5px] text-body">
                <span className="truncate font-medium text-navy">{file.name}</span>
                <span className="flex-shrink-0 text-muted">{readableSize(file.size)}</span>
              </li>
            ))}
          </ul>
        )}
      </label>

      {state === "error" && (
        <p role="alert" className="border-l-[3px] border-amber-500 bg-amber-300/20 px-4 py-3 text-[14px] text-body">
          {error}
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={state === "sending"}
          className="btn-primary inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-7 py-3.5 text-[15px] font-bold text-navy transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === "sending" ? c.sending : c.submit}
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
