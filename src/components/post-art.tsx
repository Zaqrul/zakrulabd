import { SvgBusinessChat, SvgBusinessShop, SvgChef } from "iblis-react-undraw";
import type { Post } from "@/lib/posts";

/* The drawings live here rather than in posts.ts so that file stays plain data.
   Both the card thumbnail and the banner at the top of an article pull from the
   same map, so a post cannot end up illustrated two different ways. */
const art = {
  chef: SvgChef,
  shop: SvgBusinessShop,
  chat: SvgBusinessChat,
};

export function PostArt({ art: key, height, className = "" }: { art: Post["art"]; height: number; className?: string }) {
  const Art = art[key];
  return <Art primarycolor="#f7c325" height={height} className={className} />;
}
