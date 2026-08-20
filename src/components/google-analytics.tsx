import { GoogleAnalytics as GA } from "@next/third-parties/google";

/* GA4, loaded only when a measurement ID is configured. Without the guard every
   local run and preview deployment would report into the same property as
   production and skew the numbers. The App Router integration already sends a
   page_view on client-side route changes, so /compare is counted too. */
export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return null;
  return <GA gaId={gaId} />;
}
