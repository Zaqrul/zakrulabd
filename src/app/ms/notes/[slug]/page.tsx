import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostPage from "@/app/(en)/notes/[slug]/page";
import { postSlug } from "@/lib/posts";
import { getPostMs, postPaths, postsMs } from "@/lib/posts-ms";
import { url } from "@/lib/site";

export function generateStaticParams() {
  return postsMs.map((post) => ({ slug: postSlug(post) }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPostMs((await params).slug);
  if (!post) return { title: "Halaman Tidak Ditemui", robots: { index: false, follow: true } };
  const paths = postPaths(post);

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: paths.ms, languages: { en: url(paths.en), ms: url(paths.ms), "x-default": url(paths.en) } },
    openGraph: { type: "article", title: post.title, description: post.description, url: url(paths.ms), locale: "ms_MY", publishedTime: post.date, authors: ["Muhamad Zaqrul"] },
  };
}

export default async function MalayPostPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!getPostMs((await params).slug)) notFound();
  return <PostPage params={params} locale="ms" />;
}
