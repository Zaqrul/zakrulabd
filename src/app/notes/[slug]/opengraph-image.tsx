import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getPost, posts } from "@/lib/posts";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "zakrulabd";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);

  return ogImage({
    eyebrow: post?.tag ?? "NOTES",
    title: post?.title ?? "Notes",
    note: post?.readingTime ?? "",
  });
}
