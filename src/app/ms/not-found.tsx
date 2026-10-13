import type { Metadata } from "next";
import Link from "next/link";
import { AutoRecover } from "@/components/auto-recover";
import { StatusPage, statusButton } from "@/components/status-page";
import { UnderlineLink } from "@/components/underline-link";
import { contentMs } from "@/lib/content-ms";
import { RevealText } from "@/components/reveal-text";
import { AsciiRipple } from "@/components/ascii-ripple";

export const metadata: Metadata = { title: "Halaman Tidak Ditemui", robots: { index: false, follow: true }, alternates: { canonical: undefined } };
const jumps = ["/ms/#services", "/ms/#projects", "/ms/#pricing", "/ms/compare"];

export default function MalayNotFound() {
  const c = contentMs.notFound;
  return <StatusPage locale="ms" code={c.code} titleA={c.titleA} titleHl={c.titleHl} body={c.body} illustration={<div data-ripple-host className="h-44 w-full cursor-crosshair"><AsciiRipple text={c.code} fontSize={9} color="#171717" rippleColor="#e0ad12" rain={0.5} /></div>} actions={<><Link href="/ms" className={statusButton.primary}>{c.primary}</Link><Link href="/ms/#pricing" className={statusButton.outline}>{c.secondary}</Link></>}>
    <AutoRecover />
    <div className="mt-6 flex flex-col items-center gap-3 border-t border-border pt-6">
      <span className="text-[11px] font-bold uppercase tracking-wide text-muted"><RevealText text>{c.linksLabel}</RevealText></span>
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">{c.links.map((label, i) => <UnderlineLink key={label} href={jumps[i]} className="text-[13.5px] font-semibold text-navy">{label}</UnderlineLink>)}</div>
    </div>
  </StatusPage>;
}
