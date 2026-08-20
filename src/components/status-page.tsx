import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";

/* 404 and the error boundary are the same page with different words and a
   different drawing, so the shell lives here: site header, one centred column,
   the illustration in amber, then the ways out. Anything that lands a visitor
   here is a dead end, so both pages always offer somewhere to go next. */
export function StatusPage({
  code,
  titleA,
  titleHl,
  body,
  illustration,
  actions,
  children,
}: {
  code: string;
  titleA: string;
  titleHl: string;
  body: string;
  illustration: React.ReactNode;
  actions: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-bg text-ink selection:bg-amber-400 selection:text-navy">
      <header className="border-b border-border bg-bg">
        <div className="mx-auto flex max-w-shell items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center">
              <Image
                src="/logo-ghost-outline.webp"
                alt="zakrulabd logo"
                width={512}
                height={512}
                className="h-8 w-8 object-contain"
              />
            </div>
            <span className="font-display text-lg font-bold text-navy">zakrulabd</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-shell flex-1 items-center justify-center px-6 py-16">
        <div className="flex w-full max-w-xl flex-col items-center gap-5 text-center">
          <div className="w-full max-w-[300px]">{illustration}</div>

          <span className="font-mono text-[13px] font-bold tracking-[0.2em] text-muted">{code}</span>

          <h1 className="font-display text-[30px] font-extrabold leading-tight tracking-tight text-navy md:text-5xl">
            {titleA}
            <span className="hl">{titleHl}</span>
          </h1>

          <p className="max-w-lg text-[15px] leading-relaxed text-body md:text-base">{body}</p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">{actions}</div>

          {children}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

/* Same geometry as the buttons on the homepage: the amber fill is the action
   the visitor most likely wants, the outline is the way back. */
export const statusButton = {
  primary:
    "btn-primary inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-sm font-bold text-navy transition-colors hover:bg-amber-600",
  outline:
    "btn-primary inline-flex items-center justify-center gap-2 rounded-lg border-[1.5px] border-primary-900 px-6 py-3 text-sm font-bold text-primary-900 transition-colors hover:bg-primary-900 hover:text-white",
};
