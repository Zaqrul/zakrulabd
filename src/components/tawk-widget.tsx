"use client";

import { track } from "@vercel/analytics";
import Script from "next/script";

/* Property and widget id come from the Tawk.to dashboard (Administration ->
   Chat Widget). They are not secrets: the embed URL is visible in page source
   either way. Env vars just keep the ids out of the source and let a preview
   deploy point somewhere else. With no property id set, nothing is rendered. */
const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || "default";

type TawkApi = {
  onLoad?: () => void;
  onChatStarted?: () => void;
  onOfflineSubmit?: () => void;
  setAttributes?: (attrs: Record<string, string>, cb?: (err?: unknown) => void) => void;
};

declare global {
  interface Window {
    Tawk_API?: TawkApi;
    Tawk_LoadStart?: Date;
  }
}

/* Tawk reads window.Tawk_API the moment its bundle runs and never looks again,
   so the handlers have to be in place before the embed loads. Doing it at module
   scope — not in an effect — is what guarantees that ordering: this file is
   evaluated when the client bundle parses, long before lazyOnload fires. */
function installTawkApi() {
  const api: TawkApi = (window.Tawk_API = window.Tawk_API || {});
  window.Tawk_LoadStart = new Date();

  api.onLoad = () => {
    /* Which page the visitor was reading when they opened the chat. AI Assist
       answers from its own knowledge base and cannot see the tab, so this is the
       only way a question about "the Professional package" reaches me knowing
       the person was standing on the packages section, not a blog note. */
    api.setAttributes?.({
      page: document.title,
      pageUrl: window.location.href,
    });
  };

  /* Chat is a conversion like WhatsApp and email, and ConversionTracking only
     sees link clicks — the widget is an iframe, so nothing bubbles to the
     document. Named to line up with the events it already reports. */
  api.onChatStarted = () => report("contact_chat", "chat_started");
  api.onOfflineSubmit = () => report("contact_chat_offline", "offline_message");
}

function report(event: string, label: string) {
  const payload = { section: "tawk_widget", label, href: window.location.pathname };
  window.gtag?.("event", event, payload);
  track(event, payload);
}

if (propertyId && typeof window !== "undefined") installTawkApi();

export function TawkWidget() {
  if (!propertyId) return null;

  return (
    <Script
      id="tawk-to"
      /* lazyOnload keeps the widget off the critical path: it costs a few
         hundred KB and must not compete with first paint or the LCP image. */
      strategy="lazyOnload"
      src={`https://embed.tawk.to/${propertyId}/${widgetId}`}
    />
  );
}
