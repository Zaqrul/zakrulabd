"use client";

import Script from "next/script";

/* Property and widget id come from the Tawk.to dashboard (Administration ->
   Chat Widget). They are not secrets: the embed URL is visible in page source
   either way. Env vars just keep the ids out of the source and let a preview
   deploy point somewhere else. With no property id set, nothing is rendered. */
const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || "default";

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
