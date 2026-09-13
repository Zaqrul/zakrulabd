import type { Metadata } from "next";
import BlogIndex from "@/app/(en)/notes/page";
import { url } from "@/lib/site";

export const metadata: Metadata = {
  title: "Catatan Projek",
  description: "Catatan projek sebenar oleh Muhamad Zaqrul: keperluan pelanggan, keputusan reka bentuk dan hasil selepas pelancaran.",
  alternates: { canonical: "/ms/notes", languages: { "en-MY": url("/notes"), "ms-MY": url("/ms/notes") } },
  openGraph: { title: "Catatan Projek | Zakrul", description: "Kisah sebenar di sebalik laman web dan sistem yang saya bina.", url: url("/ms/notes"), locale: "ms_MY" },
};

export default function MalayNotesPage() { return <BlogIndex locale="ms" />; }
