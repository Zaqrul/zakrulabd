"use client";

import { useEffect } from "react";
import { Cross } from "@/components/form-field";

/* The notice about the form as a whole, sitting above the first input rather
   than floating in a corner: it introduces the field bubbles below it, and a
   message pinned to the viewport reads as belonging to the page rather than to
   the form.

   It does not dismiss itself. A notice that disappears while it is being read
   is worse than no notice, and this one names what has to be fixed. */
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
      className="rise-in flex items-start gap-3 rounded-xl bg-navy p-4 shadow-lg shadow-black/15"
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
