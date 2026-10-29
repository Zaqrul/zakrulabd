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
  onChatMinimized?: () => void;
  onChatHidden?: () => void;
  onUnreadCountChanged?: (count: number) => void;
  setAttributes?: (attrs: Record<string, string>, cb?: (err?: unknown) => void) => void;
  hideWidget?: () => void;
  showWidget?: () => void;
  maximize?: () => void;
};

/* The default Tawk bubble is hidden: the contact launcher is the only entry
   point, and "Live chat" there calls openTawkChat. A click that lands before the
   lazy embed has loaded is remembered and replayed from onLoad. */
let openWhenReady = false;

export const tawkEnabled = Boolean(propertyId);

/* Live chat is switched off: the Tawk.to embed is not loaded, and the launcher's
   "Live chat" button hands the visitor to WhatsApp instead. Set to false to turn
   the widget back on. */
export const tawkPaused = true;

/* Unread replies in the chat, for the contact deck's badge. The widget itself is
   hidden, so without this a reply would arrive with nothing on screen to show it. */
let unreadCount = 0;
const unreadListeners = new Set<(count: number) => void>();

export function subscribeTawkUnread(listener: (count: number) => void) {
  unreadListeners.add(listener);
  listener(unreadCount);
  return () => {
    unreadListeners.delete(listener);
  };
}

export function openTawkChat() {
  const api = window.Tawk_API;
  if (api?.maximize) {
    api.showWidget?.();
    api.maximize();
  } else {
    openWhenReady = true;
  }
}

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

  api.onChatMinimized = () => api.hideWidget?.();
  api.onChatHidden = () => api.hideWidget?.();
  api.onUnreadCountChanged = (count) => {
    unreadCount = count;
    unreadListeners.forEach((listener) => listener(count));
  };

  api.onLoad = () => {
    if (openWhenReady) {
      openWhenReady = false;
      api.showWidget?.();
      api.maximize?.();
    } else {
      api.hideWidget?.();
    }

    /* Which page the visitor was reading when they opened the chat, so a
       question about "the Professional package" reaches me knowing the person
       was standing on the packages section, not a blog note. Not named `page`:
       the pre-chat form maps its notes field to that attribute, and writing it
       on every load would wipe what the visitor typed. */
    api.setAttributes?.({
      pageTitle: document.title,
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

if (propertyId && !tawkPaused && typeof window !== "undefined") installTawkApi();

export function TawkWidget() {
  if (!propertyId || tawkPaused) return null;

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
