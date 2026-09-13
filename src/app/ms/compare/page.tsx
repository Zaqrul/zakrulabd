import type { Metadata } from "next";
import ComparePage from "@/app/(en)/compare/page";
import { url } from "@/lib/site";

export const metadata: Metadata = {
  title: "Bandingkan Pakej",
  description: "Bandingkan skop pakej Permulaan, Profesional dan Lanjutan untuk laman web, kedai dalam talian, sistem tempahan serta integrasi.",
  alternates: { canonical: "/ms/compare", languages: { en: url("/compare"), ms: url("/ms/compare"), "x-default": url("/compare") } },
  openGraph: { title: "Bandingkan Pakej | Zakrul", description: "Lihat perkara yang termasuk dalam setiap pakej pembangunan web.", url: url("/ms/compare"), locale: "ms_MY" },
};

export default function MalayComparePage() { return <ComparePage locale="ms" />; }
