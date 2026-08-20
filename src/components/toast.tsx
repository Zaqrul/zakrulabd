"use client";

import { useEffect } from "react";
import { Cross } from "@/components/form-field";

/* A message about the form as a whole belongs where the eye already is, not
   pinned to the bottom of a long page: someone who presses send while a field
   is wrong is looking at the button, and a notice further down goes unread.
   So this floats over the page rather than sitting in the flow.

   Errors do not dismiss themselves. A notice that disappears while it is being
   read is worse than no notice, and this one names what has to be fixed. */
export function Toast({
  message,
  tone = "error",
  onDismiss,
  autoDismissMs,
}: {
  message: string;
  tone?: "error" | "info";
  onDismiss: () => void;
  autoDismissMs?: number;
}) {
  useEffect(() => {
    if (!autoDismissMs) return;
    const timer = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(timer);
  }, [autoDismissMs, onDismiss]);

  /* Escape closes it, the way every other transient panel on the web does. */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onDismiss();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  const error = tone === "error";

  return (
    <div
      role={error ? "alert" : "status"}
      aria-live={error ? "assertive" : "polite"}
      className="rise-in fixed inset-x-4 bottom-5 z-[80] mx-auto flex max-w-md items-start gap-3 rounded-xl border border-navy/10 bg-navy p-4 shadow-2xl shadow-black/25 sm:left-auto sm:right-6 sm:mx-0"
    >
      <span
        aria-hidden
        className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
          error ? "bg-amber-400 text-navy" : "bg-teal-600 text-white"
        }`}
      >
        {error ? (
          <span className="font-display text-[13px] font-extrabold leading-none">!</span>
        ) : (
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>

      <p className="flex-1 text-[13.5px] leading-relaxed text-white">{message}</p>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white"
      >
        <Cross />
      </button>
    </div>
  );
}
