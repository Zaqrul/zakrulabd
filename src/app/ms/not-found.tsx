import type { Metadata } from "next";
import Link from "next/link";
import { SvgLost } from "iblis-react-undraw";
import { AutoRecover } from "@/components/auto-recover";
import { StatusPage, statusButton } from "@/components/status-page";
import { UnderlineLink } from "@/components/underline-link";
import { contentMs } from "@/lib/content-ms";

export const metadata: Metadata = { title: "Halaman Tidak Ditemui", robots: { index: false, follow: true }, alternates: { canonical: undefined } };
const jumps = ["/ms/#services", "/ms/#projects", "/ms/#pricing", "/ms/compare"];

export default function MalayNotFound() {
  const c = contentMs.notFound;
  return <StatusPage locale="ms" code={c.code} titleA={c.titleA} titleHl={c.titleHl} body={c.body} illustration={<SvgLost primarycolor="#f7c325" height={200} className="mx-auto h-auto w-full" />} actions={<><Link href="/ms" className={statusButton.primary}>{c.primary}</Link><Link href="/ms/#pricing" className={statusButton.outline}>{c.secondary}</Link></>}>
    <AutoRecover />
    <div className="mt-6 flex flex-col items-center gap-3 border-t border-border pt-6">
      <span className="text-[11px] font-bold uppercase tracking-wide text-muted">{c.linksLabel}</span>
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">{c.links.map((label, i) => <UnderlineLink key={label} href={jumps[i]} className="text-[13.5px] font-semibold text-navy">{label}</UnderlineLink>)}</div>
    </div>
  </StatusPage>;
}
