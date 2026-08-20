"use client";

import { useEffect, useState } from "react";
import { SiFacebook, SiThreads, SiWhatsapp, SiX } from "react-icons/si";
import { CheckSmallIcon, LinkIcon } from "@/components/icons";

/* Share targets in the order they actually get used here: most of this site's
   readers are in Malaysia, where a link is passed on in WhatsApp far more often
   than anywhere else. Each opens the platform's own share endpoint, so nothing
   third-party is embedded and no script runs before a reader asks for it. */
function targets(url: string, title: string) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return [
    { label: "Share on WhatsApp", href: `https://wa.me/?text=${t}%20${u}`, Icon: SiWhatsapp },
    { label: "Share on Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, Icon: SiFacebook },
    { label: "Share on Threads", href: `https://www.threads.com/intent/post?text=${t}%20${u}`, Icon: SiThreads },
    { label: "Share on X", href: `https://x.com/intent/tweet?text=${t}&url=${u}`, Icon: SiX },
  ];
}

export function ShareLinks({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  /* Clear the confirmation on its own rather than leaving the button stuck
     reading "copied" for the rest of the visit. */
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      /* Clipboard access is refused on an insecure origin and in some in-app
         browsers. The share buttons still work, so this fails quietly. */
    }
  }

  const button =
    "flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition hover:border-amber-400 hover:bg-amber-400 hover:text-navy";

  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 hidden text-[12.5px] text-muted sm:inline">Share</span>

      {targets(url, title).map(({ label, href, Icon }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className={button}>
          <Icon className="h-[15px] w-[15px]" aria-hidden />
        </a>
      ))}

      <button type="button" onClick={copy} aria-label="Copy link" title={copied ? "Link copied" : "Copy link"} className={button}>
        {copied ? <CheckSmallIcon className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
      </button>
    </div>
  );
}
