import type { Metadata } from "next";
import { url } from "@/lib/site";

/* Metadata merges down the tree and unset fields are inherited, so without this
   block the root layout's title, description and — worst of all — its canonical
   would apply here, telling Google this page is a duplicate of the homepage. */
export const metadata: Metadata = {
  title: "Compare Packages",
  description:
    "What the Starter, Professional, and Advanced packages each build: 18 project types side by side, from a one-page portfolio to a booking system or online store.",
  alternates: { canonical: "/compare", languages: { en: url("/compare"), ms: url("/ms/compare"), "x-default": url("/compare") } },
  openGraph: {
    title: "Compare Packages | Zakrul",
    description:
      "What the Starter, Professional, and Advanced packages each build: 18 project types side by side, from a one-page portfolio to a booking system or online store.",
    url: url("/compare"),
  },
};

import Link from "next/link";
import Image from "next/image";
import { content } from "@/lib/content";
import { contentMs } from "@/lib/content-ms";
import { breadcrumb, faqPage } from "@/lib/structured-data";
import { ArrowRightIcon, CheckIcon, CompareIcon, HelpIcon } from "@/components/icons";
import { ScopeCompareTable } from "@/components/scope-compare";
import { Faq } from "@/components/faq";
import { SiteFooter } from "@/components/site-footer";
import { wa, waMessages } from "@/lib/contact";
import { RevealText } from "@/components/reveal-text";

export default function ComparePage({ locale = "en" }: { locale?: "en" | "ms" }) {
  const t = locale === "ms" ? contentMs : content;
  const root = locale === "ms" ? "/ms" : "";
  const c = t.pricing.compare;

  return (
    <div className="flex min-h-screen flex-col justify-between bg-bg text-ink selection:bg-amber-400 selection:text-navy">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb(locale === "ms" ? "Bandingkan Pakej" : "Compare Packages", `${root}/compare`)) }}
      />
      {locale === "en" && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage("/compare")) }} />}

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
          <Link href={locale === "ms" ? "/compare" : "/ms/compare"} hrefLang={locale === "ms" ? "en-MY" : "ms-MY"} lang={locale === "ms" ? "en" : "ms"} className="text-sm font-bold text-primary-900 hover:underline">{locale === "ms" ? "EN" : "MS"}</Link>
          <Link
            href={`${root}/#pricing`}
            className="btn-primary inline-flex items-center justify-center gap-2 rounded-lg border-[1.5px] border-primary-900 px-3.5 py-2 text-xs font-bold text-primary-900 transition-colors hover:bg-primary-900 hover:text-white"
          >
            <span>{c.back}</span>
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
          </div>
        </div>
      </header>

      {/* HERO: the dark band the homepage uses for its own set-piece sections,
          so a sub page reads as part of the same site rather than a stray page. */}
      <section className="bg-navy px-5 py-14 md:px-6 md:py-16">
        <div className="mx-auto flex w-full max-w-shell flex-col items-center gap-4 text-center md:items-start md:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold tracking-wider text-slate-200">
            <CompareIcon className="h-3.5 w-3.5" />
            {c.badge}
          </span>
          <h1 className="font-display text-[30px] font-extrabold tracking-tight text-white md:text-5xl"><RevealText immediate>
            {c.titleA}
            <span className="hl">{c.titleHl}</span>
          </RevealText></h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">{c.sub}</p>
        </div>
      </section>

      {/* CONTENT */}
      <main id="main" className="mx-auto w-full max-w-shell flex-1 px-5 py-14 md:px-6 md:py-16">
        <ScopeCompareTable locale={locale} />

        {/* The two jumps, spelled out for anyone still hovering between columns. */}
        <section className="mt-14 flex flex-col gap-5">
          <h2 className="font-display text-xl font-bold text-navy md:text-2xl"><RevealText>{c.dividesTitle}</RevealText></h2>
          <div className="grid gap-4 md:grid-cols-2">
            {c.divides.map((d) => (
              <div key={d.step} className="flex flex-col gap-3 border-t border-border pt-5">
                <span className="text-[11px] font-bold uppercase tracking-wide text-muted">{d.step}</span>
                <p className="font-display text-[15px] font-bold leading-snug text-navy md:text-base">{d.claim}</p>
                <ul className="flex flex-col gap-2">
                  {d.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-[13.5px] text-body">
                      <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-600" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ: centred under its own icon, the way the rest of the page opens. */}
        <section className="mt-16 flex flex-col gap-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-navy">
              <HelpIcon className="h-6 w-6" />
            </span>
            <h2 className="font-display text-[26px] font-extrabold tracking-tight text-navy md:text-4xl"><RevealText>
              {t.faq.titleA}
              <span className="hl">{t.faq.titleHl}</span>
            </RevealText></h2>
            <p className="max-w-xl text-sm leading-relaxed text-body md:text-base">{t.faq.sub}</p>
          </div>
          <Faq locale={locale} />
        </section>

        {/* Both ways out: pick a package back on the pricing grid, or just ask. */}
        <div className="mt-12 flex flex-col items-start justify-between gap-5 bg-amber-300/20 p-6 sm:flex-row sm:items-center md:p-8">
          <div>
            <h2 className="font-display text-lg font-bold text-navy"><RevealText>{c.closeTitle}</RevealText></h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-body">{c.closeBody}</p>
          </div>
          <div className="flex flex-shrink-0 flex-wrap gap-3">
            <Link
              href={`${root}/#pricing`}
              className="btn-primary inline-flex items-center justify-center gap-2 rounded-lg border-[1.5px] border-primary-900 px-6 py-3 text-sm font-bold text-primary-900 transition-colors hover:bg-primary-900 hover:text-white"
            >
              {c.back}
            </Link>
            <a
              href={wa(waMessages.quote)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-sm font-bold text-navy transition-colors hover:bg-amber-600"
            >
              {t.pricing.tiers[2].cta}
            </a>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <SiteFooter locale={locale} alternatePath={locale === "ms" ? "/compare" : "/ms/compare"} />
    </div>
  );
}
