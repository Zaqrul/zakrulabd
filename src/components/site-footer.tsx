import Image from "next/image";
import Link from "next/link";
import { MailIcon, MapPinIcon, PhoneIcon } from "@/components/icons";
import { content as t } from "@/lib/content";
import { WHATSAPP_NUMBER, wa, waMessages } from "@/lib/contact";

/* The one footer the whole site uses. Section links are absolute (/#pricing)
   rather than bare hashes so they work from a sub page as well as the homepage,
   where the path is already "/" and the jump stays a same-document scroll. */
export function SiteFooter() {
  return (
    <footer className="bg-navy px-6 py-14 text-slate-400">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 grid grid-cols-2 gap-8 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="col-span-2 flex max-w-xs flex-col gap-3.5 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center">
                <Image src="/logo-ghost-outline.webp" alt="" width={512} height={512} className="h-7 w-7 object-contain" />
              </div>
              <span className="font-display text-base font-bold text-white">zakrulabd</span>
            </div>
            <p className="text-[13.5px] leading-relaxed">{t.footer.blurb}</p>
            <a href="mailto:zakrulabd@gmail.com" className="flex items-center gap-2 text-[13px] hover:text-white">
              <MailIcon className="h-[15px] w-[15px]" />
              <span>zakrulabd@gmail.com</span>
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[13px] hover:text-white"
            >
              <PhoneIcon className="h-[15px] w-[15px]" />
              <span>010-255 1527</span>
            </a>
            <div className="flex items-center gap-2 text-[13px]">
              <MapPinIcon className="h-[15px] w-[15px]" />
              <span>{t.footer.location}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-[12.5px] font-bold tracking-wide text-slate-200">{t.footer.services}</span>
            {t.footer.servicesLinks.map((l) => (
              <Link key={l} href="/#services" className="text-[13.5px] hover:text-white">
                {l}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-[12.5px] font-bold tracking-wide text-slate-200">{t.footer.howIWork}</span>
            {t.footer.howIWorkLinks.map((l, i) => (
              <Link key={l} href={["/#process", "/#pricing", "/#results"][i]} className="text-[13.5px] hover:text-white">
                {l}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-[12.5px] font-bold tracking-wide text-slate-200">{t.footer.getStarted}</span>
            <a
              href={wa(waMessages.quote)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13.5px] hover:text-white"
            >
              {t.footer.getStartedLinks[0]}
            </a>
            <Link href="/#pricing" className="text-[13.5px] hover:text-white">
              {t.footer.getStartedLinks[1]}
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 text-center sm:flex-row sm:text-left">
          <span className="text-[12.5px] text-slate-500">© 2026 zakrulabd. {t.footer.rights}</span>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[12.5px] text-slate-500 sm:justify-end">
            <Link href="/privacy" className="transition hover:text-white">
              {t.footer.privacy}
            </Link>
            <span>•</span>
            <Link href="/terms" className="transition hover:text-white">
              {t.footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
