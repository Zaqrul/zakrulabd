import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { ArrowRightIcon, PlusIcon } from "@/components/icons";
import { PostArt } from "@/components/post-art";
import { content as t } from "@/lib/content";
import { contentMs } from "@/lib/content-ms";
import { type Post, postSlug } from "@/lib/posts";
import { postPaths } from "@/lib/posts-ms";

/* Built like the client logo tiles: a white card with the artwork sitting in
   its own square panel on top, then the text underneath. The tile lifts on
   hover the same way, so the two grids read as one family. */
export function NoteCard({ post, locale = "en" }: { post: Post; locale?: "en" | "ms" }) {
  return (
    <Link
      href={locale === "ms" ? postPaths(post).ms : postPaths(post).en}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white transition duration-200 hover:-translate-y-1 hover:border-amber-400/70 hover:shadow-lg hover:shadow-black/5"
    >
      {/* Shares its name with the article banner, so opening a note morphs this
          panel into the banner instead of swapping one page for another. */}
      <ViewTransition name={`note-art-${postSlug(post)}`} share="note-morph" default="none">
        <div className="flex aspect-[4/3] items-center justify-center border-b border-border bg-bg p-6">
          <PostArt art={post.art} height={120} className="h-full max-h-[120px] w-auto max-w-full" />
        </div>
      </ViewTransition>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-wide text-muted">
          <span className="text-navy">{post.tag}</span>
          <span>{post.readingTime}</span>
        </div>

        <h3 className="font-display text-[17px] font-bold leading-snug text-navy">
          <span className="relative inline">
            {post.title}
            <span
              aria-hidden
              className="absolute -bottom-1 left-0 h-[2.5px] w-0 rounded-full bg-amber-400 transition-all duration-200 ease-out group-hover:w-full"
            />
          </span>
        </h3>

        {/* Clamped: four across leaves a narrow column, and one long excerpt
            would otherwise push its card taller than the three beside it. */}
        <p className="line-clamp-4 text-[14px] leading-relaxed text-body">{post.excerpt}</p>

        {/* The site mark signs the card: these are first-hand accounts of my
            own projects. */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
          <Image
            src="/logo-ghost-outline.webp"
            alt=""
            width={512}
            height={512}
            className="h-6 w-6 flex-shrink-0 object-contain"
          />

          <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-navy">
            {locale === "ms" ? contentMs.notes.read : t.notes.read}
            <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* Fills the fourth slot the way the client grid does: an open invitation rather
   than a post, so it is dashed, carries no artwork, and goes to contact. The
   bloom is the light-background twin of the one on the navy client tiles. */
export function NoteNextCard({ label, href }: { label: string; href?: string }) {
  /* With no href the tile is a statement, not a control: on the index it closes
     the list, and a link that goes nowhere useful is worse than no link. The
     homepage passes the final CTA and gets the hover treatment with it. */
  const base =
    "group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed border-navy/15 p-6 text-center";

  const inner = (
    <>
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--color-amber-400)_28%,transparent),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <span className="relative flex h-9 w-9 items-center justify-center">
        <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400/30 opacity-0 group-hover:animate-ping group-hover:opacity-100" />
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-navy/20 text-muted transition duration-300 group-hover:rotate-90 group-hover:border-amber-400 group-hover:bg-amber-400 group-hover:text-navy">
          <PlusIcon className="h-4 w-4" />
        </span>
      </span>

      <span className="relative font-display text-[13.5px] font-bold leading-snug text-body transition-colors duration-300 group-hover:text-navy">
        {label}
      </span>
    </>
  );

  if (!href) return <div className={base}>{inner}</div>;

  return (
    <Link href={href} className={`${base} transition duration-300 hover:-translate-y-1 hover:border-amber-400`}>
      {inner}
    </Link>
  );
}
