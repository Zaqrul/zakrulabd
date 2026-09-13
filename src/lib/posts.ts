/* Posts live here rather than in content.ts: the site copy in that file is one
   fixed set of strings, while this list grows an entry at a time and each entry
   carries its own body. Blocks instead of raw HTML so the article renders in the
   site's own type styles and nothing arbitrary can be injected. */
import type { TechKey } from "@/lib/tech";

/* A bullet can name the tool it is about, and the renderer swaps the plain
   marker for that tool's own mark. Keys are checked against the shared tech
   list, so a typo is a build error rather than a missing icon. */
export type Bullet = { text: string; tech?: TechKey };

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string }
  | { type: "ul"; items: Bullet[] }
  | { type: "image"; src: string; alt: string; width: number; height: number; caption: string };

export type Post = {
  title: string;
  /* Set only to keep an old URL alive after a title is reworded. Left unset,
     the slug is the title itself, so the address always reads as the piece. */
  slugOverride?: string;
  /* Names the drawing used as the card thumbnail. A key rather than a component
     keeps this file plain data, and the card decides how to render it. */
  art: "chef" | "shop" | "chat";
  /* Shown on the index card and used as the meta description, so it has to read
     as a sentence rather than as a keyword list. */
  excerpt: string;
  description: string;
  date: string;
  readingTime: string;
  tag: string;
  author: string;
  body: Block[];
};

export const posts: Post[] = [
  {
    title: "The kuih maker who had no time to market",
    art: "chef",
    excerpt:
      "Siti Sapura makes traditional kuih in Ipoh and sells most of it by word of mouth. Here is what I built for her, and why it has no shopping cart.",
    description:
      "How I built the Sri Tanduk website: a Next.js portfolio and order form for a traditional kuih business in Ipoh, with WhatsApp instead of a payment gateway.",
    date: "2026-08-20",
    readingTime: "6 min read",
    tag: "CASE STUDY",
    author: "Muhamad Zaqrul",
    body: [
      {
        type: "p",
        text: "Siti Sapura Imran starts work before most people are awake. She makes traditional kuih in Ipoh, and her kek gula hangus is the one people come back for. If you have had a good one, you know the difference. The top is smooth, the middle is dark and slightly bitter from the burnt sugar, and it does not taste like the version you find in a supermarket chiller.",
      },
      {
        type: "p",
        text: "Her problem was not the food. It was that nobody outside her own circle knew the food existed.",
      },
      { type: "h2", text: "The real problem was time, not marketing" },
      {
        type: "p",
        text: "Every small food business owner I have met says a version of the same thing. They know they should post more. They know they should reply faster. Then the orders come in, the kitchen starts, and the day is gone. Marketing is the task that gets pushed to tomorrow every single day.",
      },
      {
        type: "p",
        text: "Siti Sapura was in exactly that position. She had no engagement to speak of, no place to send someone who asked what she sells, and no time to build one between batches. What she needed was not a campaign. She needed something that would keep working while she was busy with the mixer.",
      },
      {
        type: "p",
        text: "A website made sense here in a way it does not for every business. She sells around Ipoh and the towns near it. When someone in Perak searches for kuih for a kenduri or an office event, she should be one of the names that comes up. A website is also the one place online that belongs to her. Nobody can change the rules on it or hide her posts.",
      },
      { type: "h2", text: "The first question I ask every client" },
      {
        type: "p",
        text: "Before I write a line of code, I ask what personality the site should have. Modern and clean, or plain and simple? People find this question easier to answer than anything technical, and the answer decides most of what follows.",
      },
      {
        type: "quote",
        text: "Elegant, but still traditional.",
      },
      {
        type: "p",
        text: "That is a harder brief than it sounds. Push too far towards elegant and it starts to look like a boutique cafe that charges too much for coffee. Push too far towards traditional and it looks dated, which reads as neglected rather than authentic.",
      },
      {
        type: "p",
        text: "So I spent time looking at how other food businesses handle it, in Malaysia and elsewhere. What kept working was restraint. Warm colours rather than bright ones. Generous space around the photographs, because the kuih is the thing worth looking at. Type that has some character in the headings and gets out of the way in the body text. None of that is invention on my part. It is just what suits the product.",
      },
      {
        type: "image",
        src: "/notes/sri-tanduk-about.webp",
        alt: "The Kisah Sri Tanduk page telling the business story from 1999 onwards",
        width: 1920,
        height: 1080,
        caption:
          "The story page. A script face for the brand name, a plain one for everything you actually have to read.",
      },
      {
        type: "p",
        text: "The business has been going since 1999, and it started with banana crisps before it became kuih. That history is worth a page of its own rather than a line in a footer. It is the part a competitor cannot copy.",
      },
      { type: "h2", text: "Wireframes before anything gets built" },
      {
        type: "p",
        text: "I never take a brief straight into code. I put a wireframe together first, usually in Figma, sometimes in Balsamiq when the point is to keep it deliberately rough, and I walk the client through it.",
      },
      {
        type: "p",
        text: "This step saves everyone. A client who sees only the finished site has to imagine what else it could have been, and that is when the awkward requests arrive. A client who sees the layout early can say \"the order form should come before the story\" while moving it costs nothing. Siti Sapura made her calls at that stage, and by the time I started building, we already agreed on what the pages were for.",
      },
      { type: "h2", text: "What I built it with" },
      {
        type: "p",
        text: "The stack was chosen to be fast and to cost her almost nothing to keep running.",
      },
      {
        type: "ul",
        items: [
          {
            tech: "next",
            text: "Next.js and React, so the pages are prerendered and arrive quickly on a phone with average reception, which is how most of her customers will see it.",
          },
          {
            tech: "tailwind",
            text: "Tailwind CSS, so the spacing and type stay consistent across pages instead of drifting as the site grows.",
          },
          {
            tech: "vercel",
            text: "Vercel for hosting, which serves the site from a global edge and costs nothing at her traffic.",
          },
          {
            tech: "cloudflare",
            text: "Cloudflare for DNS, and a proper domain of her own rather than a free subdomain, because the address is part of the business now.",
          },
        ],
      },
      {
        type: "p",
        text: "The domain is worth dwelling on. It is the smallest recurring cost in the whole project and the only part she would keep if everything else were rebuilt from scratch. Business cards, the WhatsApp profile, the Google listing all point at it.",
      },
      {
        type: "image",
        src: "/sritanduk-preview.webp",
        alt: "The Sri Tanduk website showing the kuih product listing",
        width: 1000,
        height: 483,
        caption: "The product listing. Choose the kuih, the size, the quantity, and when it is needed.",
      },
      { type: "h2", text: "Why there is no checkout" },
      {
        type: "p",
        text: "The obvious next step would have been a payment gateway. FPX, card payments, an order confirmation email, the whole thing. I did not build that, and I think it would have been the wrong call.",
      },
      {
        type: "p",
        text: "Her payments were still manual, the budget was small, and her goal for this stage was simply to be found on Google and Google Business. A gateway would have added a monthly cost, a merchant application, and a new system for her to check every day. It would have solved a problem she did not have yet.",
      },
      {
        type: "p",
        text: "So the site lists what she sells, and the order form does the tedious part. A customer picks the type of kuih, the size, the quantity, and the delivery details. When they submit, all of it is composed into a WhatsApp message and opens straight in her personal WhatsApp, already filled in.",
      },
      {
        type: "image",
        src: "/notes/sri-tanduk-order-modal.webp",
        alt: "The Kek Gula Hangus product panel with a size picker and a Tempah via WhatsApp button",
        width: 1920,
        height: 1080,
        caption: "Price, size, minimum order, and the two delivery notes customers used to ask about every single time.",
      },
      {
        type: "p",
        text: "Nothing new to learn. She answers orders the same way she always has, in the app she already has open. The customer does not fill in a form and then wait, wondering whether anyone saw it. The conversation starts immediately, which is also when a customer is most likely to add one more tray.",
      },
      {
        type: "p",
        text: "The panel also does quiet work that has nothing to do with software. It states the minimum order, that delivery cost depends on distance, and that two days notice helps. Those were the questions she answered by hand, in every conversation, before anyone got round to ordering anything.",
      },
      { type: "h2", text: "What happened after launch" },
      {
        type: "p",
        text: "The site started ranking on Google after two or three months. In that early stretch it was drawing somewhere between one and two hundred visitors, from roughly five hundred impressions in Search Console.",
      },
      {
        type: "p",
        text: "Those are small numbers by internet standards, and I would rather say so than dress them up. But they are not internet numbers. They are people in and around Ipoh looking for kuih, arriving at a page that answers them, with her WhatsApp one tap away. For a business that had no online presence at all a few months earlier, that is a real change.",
      },
      {
        type: "p",
        text: "She was happy with it, which matters more to me than the analytics. When the person who runs the business enjoys sending people to their own website, the website is doing its job.",
      },
      { type: "h2", text: "What I took from it" },
      {
        type: "p",
        text: "The temptation with a project like this is to build everything the platform can do, because you can. The better move was to build the smallest thing that removed her actual bottleneck, and to leave room for the rest later.",
      },
      {
        type: "p",
        text: "If the orders grow to the point where WhatsApp becomes the mess, then a proper cart and FPX will earn their keep, and the site is built so that day is an addition rather than a rebuild. Until then, she gets to spend her mornings making kuih instead of managing software.",
      },
    ],
  },
];

/* Lowercase, punctuation dropped, spaces to hyphens: "The kuih maker who had
   no time to market" becomes the-kuih-maker-who-had-no-time-to-market. */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/['‘’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function postSlug(post: Post) {
  return post.slugOverride ?? slugify(post.title);
}

export function getPost(slug: string) {
  return posts.find((p) => postSlug(p) === slug);
}
