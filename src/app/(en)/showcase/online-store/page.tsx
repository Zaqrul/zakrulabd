import type { Metadata } from "next";
import { StoreShowcase } from "@/components/showcase/store-showcase";

/* A design showcase, not a shop: the products are invented, so the page stays
   out of search results and keeps its own canonical rather than the root's. */
export const metadata: Metadata = {
  title: "Online Store Showcase",
  description: "A demo online store designed and built by Zakrul: product catalogue, filters, cart and checkout with FPX and DuitNow QR.",
  alternates: { canonical: "/showcase/online-store" },
  robots: { index: false, follow: true },
};

export default function OnlineStoreShowcasePage() {
  return <StoreShowcase />;
}
