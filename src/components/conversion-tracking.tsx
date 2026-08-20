"use client";

import { track } from "@vercel/analytics";
import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (command: string, event: string, params?: Record<string, unknown>) => void;
  }
}

/* Every way of reaching me leaves the site — wa.me, mailto:, tel: — so GA4 sees
   a session that simply ends and reports nothing about which button did the
   work. One capture-phase listener on the document covers every such link on
   every page, including ones rendered later, which beats threading an onClick
   through several dozen anchors and forgetting one. */
const KINDS: { test: (href: string) => boolean; event: string }[] = [
  {
    /* Both shapes reach the same chat: the direct wa.me link the buttons use,
       and the branded /wa short links next.config redirects. Matched exactly,
       so a path such as /warranty is not mistaken for one. */
    test: (href) => href.startsWith("https://wa.me/") || href === "/wa" || href.startsWith("/wa/"),
    event: "contact_whatsapp",
  },
  { test: (href) => href.startsWith("mailto:"), event: "contact_email" },
  { test: (href) => href.startsWith("tel:"), event: "contact_phone" },
];

export function ConversionTracking() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const link = (e.target as HTMLElement | null)?.closest?.("a");
      if (!link) return;

      const href = link.getAttribute("href") || "";
      const kind = KINDS.find((k) => k.test(href));
      if (!kind) return;

      /* Where on the page the click came from, so the report answers "which CTA
         earns the enquiries" rather than just "how many". Falls back to the
         link's own text when a link sits outside any section. */
      const section = link.closest("section")?.id || "unknown";
      const label = (link.getAttribute("aria-label") || link.textContent || "").trim().slice(0, 80);
      const payload = { section, label, href };

      window.gtag?.("event", kind.event, payload);
      track(kind.event, payload);
    }

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
