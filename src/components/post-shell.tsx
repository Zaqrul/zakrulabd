import { DeckNav } from "@/components/deck-nav";
import { SiteFooter } from "@/components/site-footer";

/* Header and footer for everything under /blog. Same shell the compare page
   uses, so a reader who arrives on an article from search still lands on a page
   that is recognisably part of the site and has a way into the rest of it. */
export function PostShell({ back, children, locale = "en", alternatePath }: { back: { href: string; label: string }; children: React.ReactNode; locale?: "en" | "ms"; alternatePath?: string }) {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-bg text-ink selection:bg-amber-400 selection:text-navy">
      <DeckNav locale={locale} alternatePath={alternatePath} back={back} />

      {children}

      <SiteFooter locale={locale} alternatePath={alternatePath} />
    </div>
  );
}
