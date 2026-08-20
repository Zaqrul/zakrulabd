import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostShell } from "@/components/post-shell";
import { getPost, posts, type Block } from "@/lib/posts";
import { ID } from "@/lib/structured-data";
import { SITE_URL, url } from "@/lib/site";
import { wa, waMessages } from "@/lib/contact";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/notes/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: url(`/notes/${post.slug}`),
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
            <ul key={i} className="mt-5 flex flex-col gap-3">
              {block.items.map((item) => (
                <li key={item} className="flex gap-3 text-[16px] leading-relaxed text-body">
                  <span aria-hidden className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                  <span>{item}</span>
                </li>
              ))}
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
    "@id": `${SITE_URL}/notes/${post.slug}#article`,
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@id": ID.person },
    publisher: { "@id": ID.business },
    mainEntityOfPage: url(`/notes/${post.slug}`),
    inLanguage: "en-MY",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Notes", item: url("/notes") },
      { "@type": "ListItem", position: 3, name: post.title, item: url(`/notes/${post.slug}`) },
    ],
  };

  return (
    <PostShell back={{ href: "/notes", label: "All Notes" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main id="main" className="mx-auto w-full max-w-shell flex-1 px-5 py-12 md:px-6 md:py-16">
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

        <div className="mt-12 border-t border-border pt-6 text-[13.5px] text-muted">Written by {post.author}</div>

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
