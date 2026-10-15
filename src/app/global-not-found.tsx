import type { Metadata } from "next";
import "./globals.css";
import { SiteDocument } from "@/components/site-document";
import { SITE_URL } from "@/lib/site";
import NotFound from "./(en)/not-found";

/* The site has two root layouts, (en) and ms, so there is no single layout a
   404 for an unknown address can sit in, and Next.js fell back to its own
   black page. This is the page it serves instead: the same 404 the site
   shows elsewhere, in the site's own document, fonts and styles. Next.js
   marks it noindex by itself. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Page Not Found | Zakrul",
};

export default function GlobalNotFound() {
  return (
    <SiteDocument lang="en">
      <NotFound />
    </SiteDocument>
  );
}
