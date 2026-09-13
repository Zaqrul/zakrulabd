import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";

/* Header and footer for everything under /blog. Same shell the compare page
   uses, so a reader who arrives on an article from search still lands on a page
   that is recognisably part of the site and has a way into the rest of it. */
export function PostShell({ back, children, locale = "en", alternatePath }: { back: { href: string; label: string }; children: React.ReactNode; locale?: "en" | "ms"; alternatePath?: string }) {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-bg text-ink selection:bg-amber-400 selection:text-navy">
      <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-shell items-center justify-between gap-4 px-6 py-4">
          <Link href={locale === "ms" ? "/ms" : "/"} className="flex items-center gap-2.5">
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
          <Link href={alternatePath ?? (locale === "ms" ? "/" : "/ms")} hrefLang={locale === "ms" ? "en-MY" : "ms-MY"} lang={locale === "ms" ? "en" : "ms"} className="text-sm font-bold text-primary-900 hover:underline">
            {locale === "ms" ? "EN" : "MS"}
          </Link>
          <Link
            href={back.href}
            className="btn-primary inline-flex items-center justify-center gap-2 rounded-lg border-[1.5px] border-primary-900 px-3.5 py-2 text-xs font-bold text-primary-900 transition-colors hover:bg-primary-900 hover:text-white"
          >
            <span>{back.label}</span>
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
          </div>
        </div>
      </header>

      {children}

      <SiteFooter locale={locale} alternatePath={alternatePath} />
    </div>
  );
}
