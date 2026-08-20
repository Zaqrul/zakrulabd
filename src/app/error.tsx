"use client";

import Link from "next/link";
import { useEffect } from "react";
import { SvgBugFixing } from "iblis-react-undraw";
import { AutoRecover } from "@/components/auto-recover";
import { StatusPage, statusButton } from "@/components/status-page";
import { UnderlineLink } from "@/components/underline-link";
import { content as t } from "@/lib/content";
import { wa } from "@/lib/contact";

/* Catches render errors below the root layout. It is a client component by
   requirement: `reset` re-renders the segment that threw, which is worth
   offering first — most of these are transient. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const c = t.errorPage;

  useEffect(() => {
    /* The digest is the only handle on a production error, since the message
       itself is stripped from the client bundle. Logging it means a visitor's
       screenshot can be matched to the entry in the Vercel runtime logs. */
    console.error("Unhandled error", error.digest ?? error);
  }, [error]);

  return (
    <StatusPage
      code={c.code}
      titleA={c.titleA}
      titleHl={c.titleHl}
      body={c.body}
      illustration={<SvgBugFixing primarycolor="#f7c325" height={200} className="mx-auto h-auto w-full" />}
      actions={
        <>
          {/* Most of these clear on their own, so the page keeps checking and
              recovers without the reader having to press anything. */}
          <AutoRecover onRetry={reset} />
          <button type="button" onClick={reset} className={statusButton.primary}>
            {c.primary}
          </button>
          <Link href="/" className={statusButton.outline}>
            {c.secondary}
          </Link>
        </>
      }
    >
      <UnderlineLink
        href={wa(`Hi Zakrul! Website anda keluar error${error.digest ? ` (ref: ${error.digest})` : ""}.`)}
        external
        className="mt-4 text-[13.5px] font-semibold text-navy"
      >
        {c.report}
      </UnderlineLink>
    </StatusPage>
  );
}
