import type { Metadata } from "next";
import { url } from "@/lib/site";

/* Metadata merges down the tree and unset fields are inherited, so without this
   block the root layout's title, description and — worst of all — its canonical
   would apply here, telling Google this page is a duplicate of the homepage. */
export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Scope of work, payment milestones, code ownership, and warranty terms for freelance web development by Muhamad Zaqrul.",
  alternates: { canonical: "/terms", languages: { en: url("/terms"), ms: url("/ms/terms"), "x-default": url("/terms") } },
  openGraph: {
    title: "Terms & Conditions | Zakrul",
    description: "Scope of work, payment milestones, code ownership, and warranty terms for freelance web development by Muhamad Zaqrul.",
    url: url("/terms"),
  },
};

import Link from "next/link";
import Image from "next/image";
import { content } from "@/lib/content";
import { contentMs } from "@/lib/content-ms";
import { breadcrumb } from "@/lib/structured-data";
import { WHATSAPP_NUMBER } from "@/lib/contact";
import { ArrowRightIcon, MapPinIcon, PhoneIcon } from "@/components/icons";

export default function TermsPage({ locale = "en" }: { locale?: "en" | "ms" }) {
  const t = locale === "ms" ? contentMs : content;
  const root = locale === "ms" ? "/ms" : "";
  const terms = t.termsPage;

  return (
    <div className="min-h-screen bg-bg text-ink selection:bg-amber-400 selection:text-navy flex flex-col justify-between">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb(locale === "ms" ? "Terma dan Syarat" : "Terms & Conditions", `${root}/terms`)) }}
      />
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-shell items-center justify-between gap-4 px-6 py-4">
          <Link href={root || "/"} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center">
              <Image
                src="/logo-ghost-outline.webp"
                alt="Zakrul logo"
                width={512}
                height={512}
                className="h-8 w-8 object-contain"
              />
            </div>
            <span className="font-display text-lg font-bold text-navy">Zakrul</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href={locale === "ms" ? "/terms" : "/ms/terms"} hrefLang={locale === "ms" ? "en-MY" : "ms-MY"} lang={locale === "ms" ? "en" : "ms"} className="text-sm font-bold text-primary-900 hover:underline">{locale === "ms" ? "EN" : "MS"}</Link>
            <Link
              href={root || "/"}
              className="inline-flex items-center gap-1.5 rounded-lg border border-navy/20 bg-white px-3.5 py-2 text-xs font-bold text-navy transition hover:border-navy hover:bg-navy hover:text-white"
            >
              <span>{t.footer.backToHome}</span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main id="main" className="mx-auto max-w-shell px-6 py-16 flex-1 w-full">
        {/* Title Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs font-bold tracking-wider text-muted">
            <span>{terms.badge}</span>
          </div>

          <h1 className="mt-4 font-display text-[30px] font-extrabold tracking-tight text-navy md:text-5xl">
            {terms.titleA}
            <span className="hl">{terms.titleHl}</span>
          </h1>

          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-muted">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>{terms.lastUpdated}</span>
          </div>

          <p className="mt-5 text-base leading-relaxed text-body md:text-lg">
            {terms.intro}
          </p>
        </div>

        {/* Terms Sections */}
        <div className="flex flex-col gap-8">
          {terms.sections.map((section, idx) => (
            <section
              key={idx}
              className="rounded-2xl border border-border bg-white p-7 shadow-xs transition duration-200 hover:shadow-sm"
            >
              <h2 className="font-display text-xl font-bold text-navy">
                {section.title}
              </h2>
              <div className="mt-4 flex flex-col gap-3">
                {section.content.map((paragraph, pIdx) => (
                  <p key={pIdx} className="text-sm leading-relaxed text-body">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Quick Consultation Callout */}
        <div className="mt-12 rounded-2xl border border-border bg-amber-300/15 p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <h3 className="font-display text-lg font-bold text-navy">
              {locale === "ms" ? "Bersedia memulakan projek?" : "Ready to start your project?"}
            </h3>
            <p className="text-sm text-body mt-1">
              {locale === "ms" ? "Hubungi saya untuk membincangkan keperluan, menyetujui peringkat kerja dan mendapatkan sebut harga tetap." : "Message me to talk through your requirements, agree on milestones, and get a fixed quote."}
            </p>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-xs font-bold text-navy transition hover:bg-amber-600 whitespace-nowrap"
          >
            <PhoneIcon className="h-4 w-4" />
            <span>WhatsApp Muhamad Zaqrul</span>
          </a>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border bg-white px-6 py-8 text-slate-500">
        <div className="mx-auto flex max-w-shell flex-col items-center justify-between gap-4 text-xs sm:flex-row">
          <div className="flex items-center gap-4">
            <span>© 2026 Zakrul. {t.footer.rights}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <MapPinIcon className="h-3.5 w-3.5 text-slate-400" />
              <span>{t.footer.location}</span>
            </div>
          </div>

          <div className="flex items-center gap-5 font-semibold text-navy">
            <Link href={locale === "ms" ? "/terms" : "/ms/terms"} hrefLang={locale === "ms" ? "en-MY" : "ms-MY"} lang={locale === "ms" ? "en" : "ms"} className="hover:underline text-slate-600 hover:text-navy">{locale === "ms" ? "EN" : "MS"}</Link>
            <Link href={`${root}/privacy`} className="hover:underline text-slate-600 hover:text-navy">
              {t.footer.privacy}
            </Link>
            <Link href={`${root}/terms`} className="hover:underline text-amber-600">
              {t.footer.terms}
            </Link>
            <Link href={root || "/"} className="hover:underline text-slate-600 hover:text-navy">
              {t.footer.backToHome}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
