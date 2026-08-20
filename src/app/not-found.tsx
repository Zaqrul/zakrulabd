import type { Metadata } from "next";
import Link from "next/link";
import { SvgLost } from "iblis-react-undraw";
import { AutoRecover } from "@/components/auto-recover";
import { StatusPage, statusButton } from "@/components/status-page";
import { UnderlineLink } from "@/components/underline-link";
import { content as t } from "@/lib/content";

/* A 404 must never be indexed, and it must not inherit the homepage canonical
   either — that would tell Google a missing page is the homepage. */
export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: true },
  alternates: { canonical: undefined },
};

const jumpLinks = ["/#services", "/#projects", "/#pricing", "/compare"];

export default function NotFound() {
  const c = t.notFound;

  return (
    <StatusPage
      code={c.code}
      titleA={c.titleA}
      titleHl={c.titleHl}
      body={c.body}
      illustration={<SvgLost primarycolor="#f7c325" height={200} className="mx-auto h-auto w-full" />}
      actions={
        <>
          <Link href="/" className={statusButton.primary}>
            {c.primary}
          </Link>
          <Link href="/#pricing" className={statusButton.outline}>
            {c.secondary}
          </Link>
        </>
      }
    >
      {/* The site is small enough to list in full, which beats sending someone
          back to the homepage to hunt for what they were after. */}
      {/* A 404 during a deploy is temporary: the address starts answering once
          the new build is live, and the page follows it. */}
      <AutoRecover />

      <div className="mt-6 flex flex-col items-center gap-3 border-t border-border pt-6">
        <span className="text-[11px] font-bold uppercase tracking-wide text-muted">{c.linksLabel}</span>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {c.links.map((label, i) => (
            <UnderlineLink key={label} href={jumpLinks[i]} className="text-[13.5px] font-semibold text-navy">
              {label}
            </UnderlineLink>
          ))}
        </div>
      </div>
    </StatusPage>
  );
}
