import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostArt } from "@/components/post-art";
import { PostShell } from "@/components/post-shell";
import { ShareLinks } from "@/components/share-links";
import { getPost, postSlug, posts, type Block } from "@/lib/posts";
import { ID } from "@/lib/structured-data";
import { SITE_URL, url } from "@/lib/site";
import { tech } from "@/lib/tech";
import { wa, waMessages } from "@/lib/contact";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: postSlug(post) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/notes/${postSlug(post)}` },
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
            <h2 key={i} className="mt-11 font-display text-[22px] font-bold leading-snug text-navy md:text-[26px]">
              {block.text}
            </h2>
          );
        }
        if (block.type === "quote") {
          return (
            <blockquote
              key={i}
              className="my-8 border-l-[3px] border-amber-400 pl-5 font-display text-xl font-bold leading-snug text-navy md:text-2xl"
            >
              {block.text}
            </blockquote>
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
                  <li key={item.text} className="flex gap-3 text-[16px] leading-relaxed text-body">
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
                  </li>
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
              <figcaption className="text-[13px] text-muted">{block.caption}</figcaption>
            </figure>
          );
        }
        return (
          <p key={i} className="mt-5 text-[16px] leading-relaxed text-body md:text-[17px]">
            {block.text}
          </p>
        );
      })}
    </>
  );
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  /* Article, tied by author and publisher to the same Person and business nodes
     the rest of the site declares, so this reads as one more thing that entity
     published rather than as a loose document. */
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${SITE_URL}/notes/${postSlug(post)}#article`,
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@id": ID.person },
    publisher: { "@id": ID.business },
    mainEntityOfPage: url(`/notes/${postSlug(post)}`),
    inLanguage: "en-MY",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Notes", item: url("/notes") },
      { "@type": "ListItem", position: 3, name: post.title, item: url(`/notes/${postSlug(post)}`) },
    ],
  };

  return (
    <PostShell back={{ href: "/notes", label: "All Notes" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main id="main" className="mx-auto w-full max-w-shell flex-1 px-5 py-12 md:px-6 md:py-16">
        {/* Banner across the full column, above everything. The same drawing the
            card carries, so arriving from the grid feels continuous. */}
        <div className="mb-8 flex h-44 items-center justify-center overflow-hidden rounded-2xl border border-border bg-white md:h-64">
          <PostArt art={post.art} height={220} className="h-full max-h-full w-auto max-w-[80%] py-6" />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-wide text-muted">
          <span className="text-navy">{post.tag}</span>
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </time>
          <span>{post.readingTime}</span>
        </div>

        <h1 className="mt-4 font-display text-[32px] font-extrabold leading-[1.15] tracking-tight text-navy md:text-[46px]">
          {post.title}
        </h1>

        <p className="mt-4 border-b border-border pb-8 text-[17px] leading-relaxed text-body md:text-lg">
          {post.excerpt}
        </p>

        <article>
          <Blocks blocks={post.body} />
        </article>

        {/* Same mark the cards carry, so the byline at the end of the article
            and the byline on the tile that led here look like one signature. */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-[13.5px] text-muted">
          <span className="flex items-center gap-2">
            <span>Written by</span>
            <Image
              src="/logo-ghost-outline.webp"
              alt=""
              width={512}
              height={512}
              className="h-7 w-7 flex-shrink-0 object-contain"
            />
            <span className="font-bold text-navy">{post.author}</span>
          </span>

          {/* Sharing sits at the end of the article, where someone who found it
              worth passing on has just finished reading. */}
          <ShareLinks url={url(`/notes/${postSlug(post)}`)} title={post.title} />
        </div>

        <div className="mt-8 flex flex-col gap-4 bg-amber-300/20 p-6 md:p-8">
          <h2 className="font-display text-lg font-bold text-navy">Got a business in the same spot?</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-body">
            If you are making the product and the marketing keeps getting pushed to tomorrow, tell me what you sell and
            where you sell it. I will tell you straight whether a website is what you need.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={wa(waMessages.quote)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-sm font-bold text-navy transition-colors hover:bg-amber-600"
            >
              Let&rsquo;s Discuss
            </a>
            <Link
              href="/#pricing"
              className="btn-primary inline-flex items-center justify-center gap-2 rounded-lg border-[1.5px] border-primary-900 px-6 py-3 text-sm font-bold text-primary-900 transition-colors hover:bg-primary-900 hover:text-white"
            >
              See Pricing
            </Link>
          </div>
        </div>
      </main>
    </PostShell>
  );
}
