import type { Metadata } from "next";
import Link from "next/link";
import { PostShell } from "@/components/post-shell";
import { posts } from "@/lib/posts";
import { url } from "@/lib/site";

export const metadata: Metadata = {
  title: "Notes",
  description:
    "Write-ups of real client projects: what the business needed, what I built, what it cost them, and what actually happened after launch.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Notes | zakrulabd",
    description:
      "Write-ups of real client projects: what the business needed, what I built, and what happened after launch.",
    url: url("/blog"),
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
        <div className="flex flex-col">
          {posts.map((post) => (
            <article key={post.slug} className="border-t border-border py-8 first:border-t-0 first:pt-0">
              <Link href={`/blog/${post.slug}`} className="group flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-wide text-muted">
                  <span className="text-navy">{post.tag}</span>
                  <span>{post.readingTime}</span>
                </div>
                <h2 className="max-w-3xl font-display text-2xl font-bold leading-snug text-navy group-hover:underline group-hover:decoration-amber-500 group-hover:decoration-2 group-hover:underline-offset-4 md:text-3xl">
                  {post.title}
                </h2>
                <p className="max-w-2xl text-[15px] leading-relaxed text-body">{post.excerpt}</p>
              </Link>
            </article>
          ))}
        </div>
      </main>
    </PostShell>
  );
}
