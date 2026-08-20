import Image from "next/image";
import Link from "next/link";
import { SvgBusinessShop, SvgChef, SvgBusinessChat } from "iblis-react-undraw";
import { ArrowRightIcon } from "@/components/icons";
import { content as t } from "@/lib/content";
import type { Post } from "@/lib/posts";

/* Drawings live here rather than in posts.ts so that file stays plain data.
   Each one is keyed by the post's `art` field. */
const art = {
  chef: SvgChef,
  shop: SvgBusinessShop,
  chat: SvgBusinessChat,
};

/* Built like the client logo tiles: a white card with the artwork sitting in
   its own square panel on top, then the text underneath. The tile lifts on
   hover the same way, so the two grids read as one family. */
export function NoteCard({ post }: { post: Post }) {
  const Art = art[post.art];

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white transition duration-200 hover:-translate-y-1 hover:border-amber-400/70 hover:shadow-lg hover:shadow-black/5"
    >
      <div className="flex aspect-[16/9] items-center justify-center border-b border-border bg-bg p-8">
        <Art primarycolor="#f7c325" height={150} className="h-full max-h-[150px] w-auto max-w-full" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-wide text-muted">
          <span className="text-navy">{post.tag}</span>
          <span>{post.readingTime}</span>
        </div>

        <h3 className="font-display text-xl font-bold leading-snug text-navy">
          <span className="relative inline">
            {post.title}
            <span
              aria-hidden
              className="absolute -bottom-1 left-0 h-[2.5px] w-0 rounded-full bg-amber-400 transition-all duration-200 ease-out group-hover:w-full"
            />
          </span>
        </h3>

        <p className="text-[14.5px] leading-relaxed text-body">{post.excerpt}</p>

        {/* Byline with the site mark: these are first-hand accounts of my own
            projects, and the card should say so before anyone opens it. */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="flex items-center gap-2">
            <Image
              src="/logo-ghost-outline.webp"
              alt=""
              width={512}
              height={512}
              className="h-6 w-6 flex-shrink-0 object-contain"
            />
            <span className="text-[12.5px] font-bold text-navy">{post.author}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-navy">
            {t.notes.read}
            <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
