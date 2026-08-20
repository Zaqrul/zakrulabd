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

/* A message arriving, drawn rather than illustrated: the orders in these
   projects come through WhatsApp, and the bubble says that beside the cook
   without needing a caption. Tilted a little so it reads as pinned on top of
   the drawing rather than as part of it. */
export function ChatBubble({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 76" role="img" aria-label="An order arriving as a message" className={className}>
      <path
        d="M12 4h72a8 8 0 0 1 8 8v36a8 8 0 0 1-8 8H40L20 70V56h-8a8 8 0 0 1-8-8V12a8 8 0 0 1 8-8Z"
        fill="#fbcf33"
        stroke="#171717"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <circle cx="30" cy="30" r="5" fill="#171717" />
      <circle cx="48" cy="30" r="5" fill="#171717" />
      <circle cx="66" cy="30" r="5" fill="#171717" />
    </svg>
  );
}
