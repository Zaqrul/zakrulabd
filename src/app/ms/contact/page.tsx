import type { Metadata } from "next";
import ContactPage from "@/app/(en)/contact/page";
import { url } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mulakan Projek",
  description: "Hantar ringkasan projek laman web, sistem web atau SEO kepada Muhamad Zaqrul. Saya akan membalas dengan pelan dan sebut harga tetap.",
  alternates: { canonical: "/ms/contact", languages: { en: url("/contact"), ms: url("/ms/contact"), "x-default": url("/contact") } },
  openGraph: { title: "Mulakan Projek | Zakrul", description: "Terangkan keperluan projek anda dan terima pelan serta sebut harga tetap.", url: url("/ms/contact"), locale: "ms_MY" },
};

export default function MalayContactPage() {
  return <ContactPage locale="ms" />;
}
