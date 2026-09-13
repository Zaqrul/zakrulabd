import type { Metadata } from "next";
import PostPage from "@/app/(en)/notes/[slug]/page";
import { postsMs } from "@/lib/posts-ms";
import { url } from "@/lib/site";

const post = postsMs[0];

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  alternates: { canonical: "/ms/notes/sri-tanduk", languages: { "en-MY": url("/notes/the-kuih-maker-who-had-no-time-to-market"), "ms-MY": url("/ms/notes/sri-tanduk") } },
  openGraph: { type: "article", title: post.title, description: post.description, url: url("/ms/notes/sri-tanduk"), locale: "ms_MY", publishedTime: post.date, authors: ["Muhamad Zaqrul"] },
};

export default function MalaySriTandukPage() {
  return <PostPage params={Promise.resolve({ slug: "the-kuih-maker-who-had-no-time-to-market" })} locale="ms" />;
}
