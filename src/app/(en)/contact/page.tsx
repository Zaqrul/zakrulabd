import type { Metadata } from "next";
import Image from "next/image";
import { SvgConversation, SvgWebDevelopment } from "iblis-react-undraw";
import { ContactForm } from "@/components/contact-form";
import { CheckIcon } from "@/components/icons";
import { PostShell } from "@/components/post-shell";
import { content } from "@/lib/content";
import { contentMs } from "@/lib/content-ms";
import { breadcrumb } from "@/lib/structured-data";
import { url } from "@/lib/site";

export const metadata: Metadata = {
  title: "Start a Project",
  description:
    "Send me a brief for a website, a custom web system, or SEO work in Malaysia. Pick the package closest to what you need, attach anything that helps, and I reply within one working day with a plan and a fixed quote.",
  alternates: { canonical: "/contact", languages: { en: url("/contact"), ms: url("/ms/contact"), "x-default": url("/contact") } },
  openGraph: {
    title: "Start a Project | Zakrul",
    description:
      "Pick a package, tell me what you need built, attach anything that helps. A plan and a fixed quote within one working day.",
    url: url("/contact"),
  },
};

export default function ContactPage({ locale = "en" }: { locale?: "en" | "ms" }) {
  const t = locale === "ms" ? contentMs : content;
  const c = t.contactPage;

  return (
    <PostShell locale={locale} alternatePath={locale === "ms" ? "/contact" : "/ms/contact"} back={{ href: locale === "ms" ? "/ms" : "/", label: locale === "ms" ? "Kembali ke Laman Utama" : "Back to Home" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb(locale === "ms" ? "Mulakan Projek" : "Start a Project", locale === "ms" ? "/ms/contact" : "/contact")) }}
      />

      <section className="bg-navy px-5 py-14 md:px-6 md:py-16">
        <div className="mx-auto flex w-full max-w-shell flex-col gap-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400">{c.badge}</span>
          <h1 className="font-display text-[30px] font-extrabold tracking-tight text-white md:text-5xl">
            {c.titleA}
            <span className="hl">{c.titleHl}</span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">{c.sub}</p>
        </div>
      </section>

      <main id="main" className="mx-auto w-full max-w-shell flex-1 px-5 py-14 md:px-6 md:py-16">
        {/* Two columns from lg up. The form keeps a reading measure rather than
            the full shell, because a 1200px text field looks like a search bar
            rather than somewhere to write a few paragraphs, and the drawing
            fills the space that leaves instead of a stretch of empty grey. */}
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-16">
          <div className="max-w-2xl">
            {/* Phones lose the whole side column, so the form opened on a bare
                field with nothing of the site around it. One drawing above it,
                smaller than the desktop pair and only shown where that column
                is gone, keeps the page recognisable without pushing the first
                field off the screen. */}
            <div className="mb-8 flex items-center gap-4 border-b border-border pb-6 lg:hidden">
              <div className="w-1/2 max-w-[190px] flex-shrink-0">
                <SvgConversation primarycolor="#f7c325" height={190} className="h-auto w-full" />
              </div>

              {/* Beside the drawing rather than under it: the two together fill
                  one band above the form, where stacked they would push the
                  first field off a phone screen. */}
              <blockquote className="min-w-0 border-l-2 border-amber-400 pl-3">
                <p className="font-display text-[11.5px] font-bold leading-snug text-navy">{c.quote}</p>
                <footer className="mt-1.5 flex items-center gap-1 text-[10.5px] text-muted">
                  <span>{c.quoteByLabel}</span>
                  <span className="font-bold text-navy">{c.quoteBy}</span>
                  <Image
                    src="/logo-ghost-outline.webp"
                    alt=""
                    width={512}
                    height={512}
                    className="h-3.5 w-3.5 flex-shrink-0 object-contain"
                  />
                </footer>
              </blockquote>
            </div>

            <ContactForm locale={locale} />
          </div>

          <aside className="hidden flex-col items-center gap-6 lg:flex">
            {/* Still, not floating: the form is where the attention belongs,
                and a drawing that moves beside a text field competes with it. */}
            <div className="w-full max-w-[420px]">
              <SvgConversation primarycolor="#f7c325" height={360} className="mx-auto h-auto w-full" />
            </div>

            <ul className="flex w-full flex-col gap-3 border-t border-border pt-6">
              {c.assurances.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-body">
                  <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-600" />
                  {line}
                </li>
              ))}
            </ul>

            {/* The column ran out before the form did, leaving a stretch of
                empty grey beside the longest fields. A second drawing from the
                same set closes it: what happens after the enquiry. */}
            <div className="flex w-full max-w-[380px] flex-col gap-6 border-t border-border pt-8">
              <SvgWebDevelopment primarycolor="#f7c325" height={300} className="mx-auto h-auto w-full" />

              {/* How I work, in one sentence, where someone deciding whether to
                  write to me is already looking. */}
              <blockquote className="border-l-[3px] border-amber-400 pl-4">
                <p className="font-display text-[15px] font-bold leading-snug text-navy">{c.quote}</p>
                {/* Same mark and byline shape the note cards use, so a
                    signature on this site always looks like one. */}
                <footer className="mt-2.5 flex items-center gap-1.5 text-[12.5px] text-muted">
                  <span>{c.quoteByLabel}</span>
                  <span className="font-bold text-navy">{c.quoteBy}</span>
                  <Image
                    src="/logo-ghost-outline.webp"
                    alt=""
                    width={512}
                    height={512}
                    className="h-5 w-5 flex-shrink-0 object-contain"
                  />
                </footer>
              </blockquote>
            </div>
          </aside>
        </div>
      </main>
    </PostShell>
  );
}
