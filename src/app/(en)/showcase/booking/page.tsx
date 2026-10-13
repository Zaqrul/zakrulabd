import type { Metadata } from "next";
import { BookingShowcase } from "@/components/showcase/booking-showcase";

/* A design showcase, not a business: the photographer is invented and the
   photos are from Unsplash, so the page stays out of search results and keeps
   its own canonical. */
export const metadata: Metadata = {
  title: "Booking System Showcase",
  description:
    "A demo booking system for a wedding and portrait photographer, designed and built by Zakrul: live availability, deposits by FPX or DuitNow QR, and the photographer's side of every booking.",
  alternates: { canonical: "/showcase/booking" },
  robots: { index: false, follow: true },
};

export default function BookingShowcasePage() {
  return <BookingShowcase />;
}
