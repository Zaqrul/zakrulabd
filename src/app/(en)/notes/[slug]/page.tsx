import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { SvgCelebration } from "iblis-react-undraw";
import { PostArt } from "@/components/post-art";
import { PostShell } from "@/components/post-shell";
import { ReadComplete, ReadingProgress } from "@/components/reading-progress";
import { ShareLinks } from "@/components/share-links";
import { content } from "@/lib/content";
import { contentMs } from "@/lib/content-ms";
import { getPost, postSlug, posts, type Block } from "@/lib/posts";
import { getPostMs, postPaths } from "@/lib/posts-ms";
import { ID } from "@/lib/structured-data";
import { SITE_URL, url } from "@/lib/site";
import { tech } from "@/lib/tech";
import { wa, waMessages } from "@/lib/contact";
import { RevealText } from "@/components/reveal-text";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: postSlug(post) }));
}

/* Only the slugs above exist. Without this an unknown one is rendered on
   demand, which answered 200 and, because generateMetadata had nothing to
   return, served the homepage's title and share card under a dead article
   URL. Anything shared from such a link previewed as the homepage. */
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  /* Never inherit the root metadata here: a missing article that borrows the
     homepage title and image is worse than one with no preview at all. */
  if (!post) return { title: "Page Not Found", robots: { index: false, follow: true } };

  return {
    metadataBase: new URL(SITE_URL),
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/notes/${postSlug(post)}`,
      languages: {
        en: url(`/notes/${postSlug(post)}`),
        ms: url(postPaths(post).ms),
        "x-default": url(`/notes/${postSlug(post)}`),
      },
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: url(`/notes/${postSlug(post)}`),
      publishedTime: post.date,
      authors: ["Muhamad Zaqrul"],
    },
  };
}

/* One block renderer, so every article shares the same measure, spacing and
   heading scale no matter who writes the next one. */
function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === "h2") {
          return (
            <h2 key={i} className="mt-11 font-display text-[22px] font-bold leading-snug text-navy md:text-[26px]"><RevealText>
              {block.text}
            </RevealText></h2>
          );
        }
        if (block.type === "quote") {
          return (
            <blockquote
              key={i}
              className="my-8 border-l-[3px] border-amber-400 pl-5 font-display text-xl font-bold leading-snug text-navy md:text-2xl"
            ><RevealText text>
              {block.text}
            </RevealText></blockquote>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={i} className="mt-5 flex flex-col gap-3.5">
              {block.items.map((item) => {
                /* A bullet about a tool is marked with that tool's own logo in
                   its brand colour; everything else keeps the amber dot. */
                const Icon = item.tech ? tech[item.tech].Icon : null;
                return (
                  <li key={item.text} className="flex gap-3 text-[16px] leading-relaxed text-body"><RevealText text>
                    {Icon ? (
                      <Icon
                        aria-hidden="true"
                        className="mt-1 h-[18px] w-[18px] flex-shrink-0"
                        style={{ color: tech[item.tech!].color }}
                      />
                    ) : (
                      <span aria-hidden className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                    )}
                    <span>{item.text}</span>
                  </RevealText></li>
                );
              })}
            </ul>
          );
        }
        if (block.type === "image") {
          /* Screenshots are held to a narrower column than the page. Stretched
             to the full 1200 the interface text inside them goes soft on a
             retina screen, and quality is raised because Next's default
             re-encode is tuned for photographs rather than flat UI. */
          return (
            <figure key={i} className="my-9 mx-auto flex max-w-3xl flex-col gap-2.5">
              <Image
                src={block.src}
                alt={block.alt}
                width={block.width}
                height={block.height}
                quality={90}
                sizes="(max-width: 768px) 100vw, 768px"
                className="h-auto w-full border border-border"
              />
              <figcaption className="text-[13px] text-muted"><RevealText text>{block.caption}</RevealText></figcaption>
            </figure>
          );
        }
        return (
          <p key={i} className="mt-5 text-[16px] leading-relaxed text-body md:text-[17px]"><RevealText text>
            {block.text}
          </RevealText></p>
        );
      })}
    </>
  );
}

export default async function PostPage({ params, locale = "en" }: { params: Promise<{ slug: string }>; locale?: "en" | "ms" }) {
  const slug = (await params).slug;
  const post = locale === "ms" ? getPostMs(slug) : getPost(slug);
  if (!post) notFound();
  const t = locale === "ms" ? contentMs : content;
  const paths = postPaths(post);
  const articlePath = locale === "ms" ? paths.ms : paths.en;
  const root = locale === "ms" ? "/ms" : "";

  /* Article, tied by author and publisher to the same Person and business nodes
     the rest of the site declares, so this reads as one more thing that entity
     published rather than as a loose document. */
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${SITE_URL}${articlePath}#article`,
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@id": ID.person },
    publisher: { "@id": ID.business },
    mainEntityOfPage: url(articlePath),
    inLanguage: locale === "ms" ? "ms-MY" : "en-MY",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: locale === "ms" ? "Laman Utama" : "Home", item: url(root || "/") },
      { "@type": "ListItem", position: 2, name: locale === "ms" ? "Catatan" : "Notes", item: url(`${root}/notes`) },
      { "@type": "ListItem", position: 3, name: post.title, item: url(articlePath) },
    ],
  };

  return (
    <PostShell locale={locale} alternatePath={locale === "ms" ? paths.en : paths.ms} back={{ href: `${root}/notes`, label: t.notes.all }}>
      <ReadingProgress targetId="article-body" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main id="main" className="mx-auto w-full max-w-shell flex-1 px-5 py-12 md:px-6 md:py-16">
        {/* Banner across the full column, above everything. The same drawing the
            card carries, so arriving from the grid feels continuous. */}
        <ViewTransition name={`note-art-${postSlug(post)}`} share="note-morph" default="none">
          <div className="mb-8 flex h-44 items-center justify-center overflow-hidden rounded-2xl border border-border bg-white md:h-64">
            <PostArt art={post.art} height={220} className="h-full max-h-full w-auto max-w-[80%] py-6" />
          </div>
        </ViewTransition>

        <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-wide text-muted">
          <span className="text-navy"><RevealText text immediate>{post.tag}</RevealText></span>
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString(locale === "ms" ? "ms-MY" : "en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </time>
          <span>{post.readingTime}</span>
        </div>

        <h1 className="mt-4 font-display text-[32px] font-extrabold leading-[1.15] tracking-tight text-navy md:text-[46px]"><RevealText immediate>
          {post.title}
        </RevealText></h1>

        <p className="mt-4 border-b border-border pb-8 text-[17px] leading-relaxed text-body md:text-lg"><RevealText text immediate>
          {post.excerpt}
        </RevealText></p>

        <article id="article-body">
          <Blocks blocks={post.body} />
        </article>

        {/* Same mark the cards carry, so the byline at the end of the article
            and the byline on the tile that led here look like one signature. */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-[13.5px] text-muted">
          <span className="flex items-center gap-2">
            <span>{locale === "ms" ? "Ditulis oleh" : "Written by"}</span>
            <Image
              src="/logo-ghost-outline.webp"
              alt=""
              width={512}
              height={512}
              className="h-7 w-7 flex-shrink-0 object-contain"
            />
            <Link href={`${root}/about`} className="font-bold text-navy underline-offset-4 hover:underline">
              Muhamad Zaqrul
            </Link>
          </span>

          {/* Sharing sits at the end of the article, where someone who found it
              worth passing on has just finished reading. */}
          <ShareLinks url={url(articlePath)} title={post.title} />
        </div>

        {/* Only appears once the end is actually on screen. */}
        <ReadComplete>
          <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-border bg-white p-8 text-center md:p-10">
            <div className="w-full max-w-[220px]">
              <SvgCelebration primarycolor="#f7c325" height={160} className="mx-auto h-auto w-full" />
            </div>
            <h2 className="font-display text-xl font-bold text-navy md:text-2xl"><RevealText>{t.notes.readDoneTitle}</RevealText></h2>
            <p className="max-w-lg text-[14.5px] leading-relaxed text-body"><RevealText text>{t.notes.readDoneBody}</RevealText></p>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`${root}/notes`}
                className="btn-primary inline-flex items-center justify-center gap-2 rounded-lg border-[1.5px] border-primary-900 px-6 py-3 text-sm font-bold text-primary-900 transition-colors hover:bg-primary-900 hover:text-white"
              >
                {t.notes.readDoneMore}
              </Link>
            </div>
          </div>
        </ReadComplete>

        <div className="mt-8 flex flex-col gap-4 bg-amber-300/20 p-6 md:p-8">
          <h2 className="font-display text-lg font-bold text-navy"><RevealText>{post.cta?.title ?? (locale === "ms" ? "Perniagaan anda menghadapi keadaan yang sama?" : "Got a business in the same spot?")}</RevealText></h2>
          <p className="max-w-2xl text-sm leading-relaxed text-body"><RevealText text>
            {post.cta?.body ?? (locale === "ms" ? "Jika anda sibuk menghasilkan produk hingga pemasaran sering tertangguh, ceritakan apa dan di mana anda menjualnya. Saya akan berterus terang sama ada laman web sesuai untuk anda." : "If you are making the product and the marketing keeps getting pushed to tomorrow, tell me what you sell and where you sell it. I will tell you straight whether a website is what you need.")}
          </RevealText></p>
          <div className="flex flex-wrap gap-3">
            <a
              href={wa(waMessages.quote)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-sm font-bold text-navy transition-colors hover:bg-amber-600"
            >
              {locale === "ms" ? "Mari Berbincang" : "Let’s Discuss"}
            </a>
            <Link
              href={`${root}/#pricing`}
              className="btn-primary inline-flex items-center justify-center gap-2 rounded-lg border-[1.5px] border-primary-900 px-6 py-3 text-sm font-bold text-primary-900 transition-colors hover:bg-primary-900 hover:text-white"
            >
              {locale === "ms" ? "Lihat Pakej" : "See Packages"}
            </Link>
          </div>
        </div>
      </main>
    </PostShell>
  );
}
