import type { Metadata } from "next";
import { InventoryShowcase } from "@/components/showcase/inventory-showcase";

/* A design showcase, not a business: the stock and suppliers are invented, so
   the page stays out of search results and keeps its own canonical. */
export const metadata: Metadata = {
  title: "Inventory System Showcase",
  description:
    "A demo inventory system designed and built by Zakrul: live stock across three locations, low-stock alerts, purchase orders and a movement log.",
  alternates: { canonical: "/showcase/inventory" },
  robots: { index: false, follow: true },
};

export default function InventoryShowcasePage() {
  return <InventoryShowcase />;
}
