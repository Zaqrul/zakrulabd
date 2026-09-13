import type { Metadata } from "next";
import TermsPage from "@/app/(en)/terms/page";
import { url } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terma dan Syarat",
  description: "Skop kerja, jadual bayaran, pemilikan kod dan jaminan projek pembangunan web oleh Muhamad Zaqrul.",
  alternates: { canonical: "/ms/terms", languages: { "en-MY": url("/terms"), "ms-MY": url("/ms/terms") } },
  openGraph: { title: "Terma dan Syarat | Zakrul", description: "Terma perkhidmatan pembangunan web dan sistem tersuai.", url: url("/ms/terms"), locale: "ms_MY" },
};

export default function MalayTermsPage() { return <TermsPage locale="ms" />; }
