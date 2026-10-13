import type { Metadata } from "next";
import { NoteCard, NoteNextCard } from "@/components/note-card";
import { PostShell } from "@/components/post-shell";
import { content } from "@/lib/content";
import { contentMs } from "@/lib/content-ms";
import { posts } from "@/lib/posts";
import { postsMs } from "@/lib/posts-ms";
import { url } from "@/lib/site";
import { Mark, RevealText } from "@/components/reveal-text";

export const metadata: Metadata = {
  title: "Notes",
  description:
    "Write-ups of real client projects: what the business needed, what I built, what it cost them, and what actually happened after launch.",
  alternates: { canonical: "/notes", languages: { en: url("/notes"), ms: url("/ms/notes"), "x-default": url("/notes") } },
  openGraph: {
    title: "Notes | Zakrul",
    description:
      "Write-ups of real client projects: what the business needed, what I built, and what happened after launch.",
    url: url("/notes"),
  },
};

export default function BlogIndex({ locale = "en" }: { locale?: "en" | "ms" }) {
  const t = locale === "ms" ? contentMs : content;
  return (
    <PostShell locale={locale} alternatePath={locale === "ms" ? "/notes" : "/ms/notes"} back={{ href: locale === "ms" ? "/ms" : "/", label: locale === "ms" ? "Kembali ke Laman Utama" : "Back to Home" }}>
      <section className="bg-navy px-5 py-14 md:px-6 md:py-16">
        <div className="mx-auto flex w-full max-w-shell flex-col gap-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400"><RevealText text immediate>{t.notes.badge}</RevealText></span>
          <h1 className="font-display text-[30px] font-extrabold tracking-tight text-white md:text-5xl"><RevealText immediate>
            {t.notes.headingA}<Mark>{t.notes.headingHl}</Mark>
          </RevealText></h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg"><RevealText text immediate>
            {locale === "ms" ? "Catatan projek sebenar: keperluan perniagaan, perkara yang saya bina serta sebabnya, hasil selepas pelancaran dan fungsi yang saya pilih untuk tidak bina." : "Write-ups of real projects. What the business needed, what I built and why, and what happened after it went live, including the parts I decided not to build."}
          </RevealText></p>
        </div>
      </section>

      <main id="main" className="mx-auto w-full max-w-shell flex-1 px-5 py-14 md:px-6 md:py-16">
        {/* Same tiles and the same four-wide grid as the homepage section, so
            arriving here from the site or from search looks identical. */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(locale === "ms" ? postsMs : posts).map((post) => (
            <NoteCard key={post.title} post={post} locale={locale} />
          ))}
          <NoteNextCard label={t.notes.nextStory} />
        </div>
      </main>
    </PostShell>
  );
}
