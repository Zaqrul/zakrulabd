import type { Metadata } from "next";
import PrivacyPage from "@/app/(en)/privacy/page";
import { url } from "@/lib/site";

export const metadata: Metadata = {
  title: "Dasar Privasi",
  description: "Cara Zakrul mengumpul, menggunakan dan melindungi maklumat anda, selaras dengan undang-undang perlindungan data peribadi Malaysia.",
  alternates: { canonical: "/ms/privacy", languages: { "en-MY": url("/privacy"), "ms-MY": url("/ms/privacy") } },
  openGraph: { title: "Dasar Privasi | Zakrul", description: "Cara maklumat peribadi anda dikendalikan di zakrul.com.", url: url("/ms/privacy"), locale: "ms_MY" },
};

export default function MalayPrivacyPage() { return <PrivacyPage locale="ms" />; }
