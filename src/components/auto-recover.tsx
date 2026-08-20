"use client";

import { useEffect, useState } from "react";

/* A dead end should not stay dead if the cause clears. Both status pages mount
   this: it re-checks the address the reader actually asked for, and once the
   server answers with a real page it goes there by itself.

   Deliberately bounded. Polling forever would keep a backgrounded tab waking
   the radio on a phone, so it stops after a fixed number of tries and leaves
   the buttons on the page as the way forward. */
const INTERVAL_MS = 5000;
const MAX_ATTEMPTS = 12;

export function AutoRecover({ onRetry }: { onRetry?: () => void }) {
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (attempts >= MAX_ATTEMPTS) return;

    let cancelled = false;

    async function check() {
      /* An offline reader is the common case for a page that failed to load, so
         skip the request entirely rather than burning an attempt on it. */
      if (typeof navigator !== "undefined" && navigator.onLine === false) return;

      try {
        const response = await fetch(window.location.href, { method: "HEAD", cache: "no-store" });
        if (cancelled) return;

        if (response.ok) {
          /* onRetry belongs to the error boundary: re-rendering the segment is
             cheaper than a full load, and it keeps the reader's scroll. With no
             boundary to reset, as on a 404, a reload is the only option. */
          if (onRetry) onRetry();
          else window.location.reload();
          return;
        }
      } catch {
        /* Still unreachable. The next tick will try again. */
      }

      if (!cancelled) setAttempts((n) => n + 1);
    }

    const timer = setTimeout(check, INTERVAL_MS);

    /* Coming back online is a much better signal than the clock, so check at
       once rather than waiting out the rest of the interval. */
    window.addEventListener("online", check);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("online", check);
    };
  }, [attempts, onRetry]);

  return null;
}
