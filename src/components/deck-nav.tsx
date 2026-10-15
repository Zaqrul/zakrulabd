import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";

/* The homepage navbar's shape for every other page: a calm glass pill floating
   at the top, with the logo, the language switch and one way back. Pages that
   used to carry their own copy of this header share it here, so they cannot
   drift apart. */
export function DeckNav({
  locale = "en",
  alternatePath,
  back,
}: {
  locale?: "en" | "ms";
  /* The same page in the other language. Falls back to the other home page. */
  alternatePath?: string;
  back: { href: string; label: string };
}) {
  const ms = locale === "ms";

  return (
    <header className="sticky top-0 z-50 px-3 pt-2 sm:px-4 lg:pt-3">
      <div className="liquid-glass liquid-glass-calm mx-auto max-w-shell overflow-hidden rounded-full">
        <div className="flex items-center justify-between gap-3 py-2 pl-4 pr-2.5 sm:pl-5">
          <Link href={ms ? "/ms" : "/"} className="flex items-center gap-2.5">
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

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={alternatePath ?? (ms ? "/" : "/ms")}
              hrefLang={ms ? "en-MY" : "ms-MY"}
              lang={ms ? "en" : "ms"}
              className="px-1 text-xs font-bold text-navy underline-offset-4 hover:underline sm:text-sm"
            >
              {ms ? "EN" : "MS"}
            </Link>
            <Link
              href={back.href}
              className="btn-primary inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border-[1.5px] border-primary-900 px-3.5 py-2 text-xs font-bold text-primary-900 transition-colors hover:bg-primary-900 hover:text-white"
            >
              <span>{back.label}</span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
