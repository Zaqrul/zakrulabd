import type { Metadata } from "next";
import { NoteCard, NoteNextCard } from "@/components/note-card";
import { PostShell } from "@/components/post-shell";
import { content as t } from "@/lib/content";
import { posts } from "@/lib/posts";
import { url } from "@/lib/site";

export const metadata: Metadata = {
  title: "Notes",
  description:
    "Write-ups of real client projects: what the business needed, what I built, what it cost them, and what actually happened after launch.",
  alternates: { canonical: "/notes" },
  openGraph: {
    title: "Notes | zakrulabd",
    description:
      "Write-ups of real client projects: what the business needed, what I built, and what happened after launch.",
    url: url("/notes"),
  },
};

export default function BlogIndex() {
  return (
    <PostShell back={{ href: "/", label: "Back to Home" }}>
      <section className="bg-navy px-5 py-14 md:px-6 md:py-16">
        <div className="mx-auto flex w-full max-w-shell flex-col gap-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400">Notes</span>
          <h1 className="font-display text-[30px] font-extrabold tracking-tight text-white md:text-5xl">
            How the work actually <span className="hl">gets done</span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
            Write-ups of real projects. What the business needed, what I built and why, and what happened after it went
            live, including the parts I decided not to build.
          </p>
        </div>
      </section>

      <main id="main" className="mx-auto w-full max-w-shell flex-1 px-5 py-14 md:px-6 md:py-16">
        {/* Same tiles and the same four-wide grid as the homepage section, so
            arriving here from the site or from search looks identical. */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {posts.map((post) => (
            <NoteCard key={post.title} post={post} />
          ))}
          <NoteNextCard label={t.notes.nextStory} />
        </div>
      </main>
    </PostShell>
  );
}
