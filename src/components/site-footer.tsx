import Image from "next/image";
import Link from "next/link";
import { SiGithub, SiThreads, SiTiktok } from "react-icons/si";
import { MailIcon, MapPinIcon, PhoneIcon } from "@/components/icons";
import { content as t } from "@/lib/content";
import { WHATSAPP_NUMBER, wa, waMessages } from "@/lib/contact";

/* The handle is zakrulabd everywhere except GitHub, which predates it. rel="me"
   states that each link is another profile of the same person, so the markup
   makes the same claim the JSON-LD sameAs list does. */
const socials = [
  { href: "https://www.threads.com/@zakrulabd", label: "zakrulabd on Threads", Icon: SiThreads },
  { href: "https://www.tiktok.com/@zakrulabd", label: "zakrulabd on TikTok", Icon: SiTiktok },
  { href: "https://github.com/Zaqrul", label: "Zaqrul on GitHub", Icon: SiGithub },
];

/* The one footer the whole site uses. Section links are absolute (/#pricing)
   rather than bare hashes so they work from a sub page as well as the homepage,
   where the path is already "/" and the jump stays a same-document scroll. */
export function SiteFooter() {
  return (
    <footer className="bg-navy px-6 py-14 text-slate-400">
      <div className="mx-auto max-w-shell">
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

            <div className="mt-1 flex items-center gap-2.5">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer me"
                  aria-label={label}
                  title={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition hover:border-amber-400 hover:bg-amber-400 hover:text-navy"
                >
                  <Icon className="h-[17px] w-[17px]" aria-hidden />
                </a>
              ))}
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
              <Link
                key={l}
                href={["/#process", "/#pricing", "/#results", "/notes"][i]}
                className="text-[13.5px] hover:text-white"
              >
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
            {/* The store is a separate site on its own subdomain, so it is an
                absolute link rather than a section of this one. */}
            <a
              href={t.build.storeLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13.5px] hover:text-white"
            >
              {t.footer.store}
            </a>
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
