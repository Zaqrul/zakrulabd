"use client";

import Link from "next/link";
import { useEffect } from "react";
import { SvgBugFixing } from "iblis-react-undraw";
import { AutoRecover } from "@/components/auto-recover";
import { StatusPage, statusButton } from "@/components/status-page";
import { UnderlineLink } from "@/components/underline-link";
import { contentMs } from "@/lib/content-ms";
import { wa } from "@/lib/contact";

export default function MalayError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const c = contentMs.errorPage;
  useEffect(() => { console.error("Unhandled error", error.digest ?? error); }, [error]);
  return <StatusPage locale="ms" code={c.code} titleA={c.titleA} titleHl={c.titleHl} body={c.body} illustration={<SvgBugFixing primarycolor="#f7c325" height={200} className="mx-auto h-auto w-full" />} actions={<><AutoRecover onRetry={reset} /><button type="button" onClick={reset} className={statusButton.primary}>{c.primary}</button><Link href="/ms" className={statusButton.outline}>{c.secondary}</Link></>}>
    <UnderlineLink href={wa(`Hai Muhamad Zaqrul, laman anda memaparkan ralat${error.digest ? ` (rujukan: ${error.digest})` : ""}.`)} external className="mt-4 text-[13.5px] font-semibold text-navy">{c.report}</UnderlineLink>
  </StatusPage>;
}
