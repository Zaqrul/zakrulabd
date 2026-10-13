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
  art: "chef" | "shop" | "chat" | "security";
  /* Shown on the index card and used as the meta description, so it has to read
     as a sentence rather than as a keyword list. */
  excerpt: string;
  description: string;
  date: string;
  readingTime: string;
  tag: string;
  author: string;
  /* The closing box under the article. Left unset, the page uses its default
     pitch, which was written for the case studies. */
  cta?: { title: string; body: string };
  body: Block[];
};

export const posts: Post[] = [
  {
    title: "The security holes vibe coding leaves behind",
    art: "security",
    excerpt:
      "AI tools can turn an idea into a working app in a weekend. What they do not do is ask who else can use it. These are the security gaps that show up when someone with no technical background ships an AI-built app.",
    description:
      "Common security problems in apps built with AI coding tools by non-developers: exposed API keys, open databases, unprotected admin pages, and unlimited endpoints, plus a checklist before launch.",
    date: "2026-10-13",
    readingTime: "7 min read",
    tag: "SECURITY",
    author: "Muhamad Zaqrul",
    cta: {
      title: "Built your app with AI and not sure it is safe?",
      body: "Send me the link or the repository. I will go through the points in this article and tell you plainly what needs fixing before you launch, or before you take more users.",
    },
    body: [
      {
        type: "p",
        text: "Vibe coding means describing what you want to an AI tool and letting it write the code. You do not read the code. You run it, see if it works, and ask for the next change. For a lot of people, it is the first time they can build software without hiring anyone.",
      },
      {
        type: "p",
        text: "I think that is a good thing. A business owner who can prototype their own booking form or internal dashboard understands their problem better than any developer they could brief. The trouble starts when that prototype goes live with real customers, real data, and real money behind it.",
      },
      { type: "h2", text: "Working is not the same as safe" },
      {
        type: "p",
        text: "When you test an app, you test it as yourself. You log in, click the buttons, and check that the right thing happens. An attacker does none of that. They skip the buttons and talk to your server directly, send data your form would never send, and open pages that are not linked anywhere.",
      },
      {
        type: "p",
        text: "AI tools build what you ask for. If you ask for a page that shows a customer their orders, you get one. Unless you also ask how it stops one customer from reading another customer's orders, that part is often missing, and nothing on screen tells you.",
      },
      { type: "quote", text: "The app does what you asked. Nobody asked who else is allowed to use it." },
      { type: "h2", text: "1. Secret keys sitting in the browser" },
      {
        type: "p",
        text: "Most apps talk to paid services: OpenAI, Stripe, an email provider, a database. Each one gives you a secret key. If that key is placed in front-end code, anyone can open the browser's developer tools and copy it. With an AI key, they run their own workload on your bill. With a payment or database key, the damage is worse.",
      },
      {
        type: "p",
        text: "The same goes for a .env file pushed to a public GitHub repository. Bots scan GitHub for leaked keys constantly, and a key can be abused within minutes of being pushed. Secret keys belong on the server only, and any key that has ever been exposed should be revoked and replaced, not just deleted from the code.",
      },
      { type: "h2", text: "2. A database anyone can read" },
      {
        type: "p",
        text: "Supabase and Firebase are popular with AI tools because the app can talk to the database straight from the browser. That design is safe only when access rules are switched on: Row Level Security in Supabase, Security Rules in Firebase. Without them, the public key shipped in your app can read, and sometimes change or delete, every row in the table.",
      },
      {
        type: "p",
        text: "This is one of the most common problems in AI-built apps, because the app works perfectly with the rules off. Customer names, phone numbers, addresses, and orders end up readable by anyone who knows where to look. In Malaysia, that is also a PDPA problem, not just a technical one.",
      },
      { type: "h2", text: "3. Admin pages that only hide the button" },
      {
        type: "p",
        text: "A common pattern: the app checks whether you are an admin, and if not, hides the admin menu. But the admin page itself, and the server functions behind it, never check anything. Anyone who types the address or calls the function directly gets in.",
      },
      {
        type: "p",
        text: "Every action that reads or changes data must check on the server who is asking and whether they are allowed. Hiding a button is decoration, not security.",
      },
      { type: "h2", text: "4. Trusting whatever the form sends" },
      {
        type: "p",
        text: "Checks in the browser, like a required field or a maximum length, are there to help honest users. They do nothing against someone sending requests directly. If the server does not check the data again, it can end up stored, displayed to other users, or passed into a database query as it is. That is how injection and cross-site scripting happen. File uploads are a related risk: an upload that accepts any file type can be used to host malware on your domain.",
      },
      { type: "h2", text: "5. No limits on anything that costs money" },
      {
        type: "p",
        text: "A contact form that sends an email, a chatbot that calls an AI model, a sign-up that sends an SMS code. Each request costs a little. Without rate limits, a single script can send thousands of requests an hour, and you find out when the bill arrives or your email provider suspends the account for spam.",
      },
      { type: "h2", text: "6. Packages nobody checked" },
      {
        type: "p",
        text: "AI tools install packages freely, and sometimes suggest package names that do not exist. Attackers register those invented names and fill them with malicious code, waiting for the next AI to suggest them. Others are real but years out of date, with known vulnerabilities. If nobody reads the list of what was installed, nobody knows what is running.",
      },
      { type: "h2", text: "Asking the AI if it is secure is not a check" },
      {
        type: "p",
        text: "It is tempting to finish with \"make sure this is secure\" and trust the answer. The AI will usually say yes, and may add a few improvements. But it is checking its own work, with the same blind spots it had when it wrote it, and it cannot see your database settings, your hosting, or what you pasted into the dashboard. A review needs someone, or something, that looks at the running app from the outside.",
      },
      { type: "h2", text: "A short checklist before you launch" },
      {
        type: "ul",
        items: [
          { text: "No secret keys in front-end code or in the GitHub repository. Any key that was exposed has been revoked and replaced." },
          { text: "Database access rules are on, and you have tested that one user cannot read another user's data." },
          { text: "Every admin page and server function checks the user's role on the server, not only in the menu." },
          { text: "The server validates all input again, including file type and size for uploads." },
          { text: "Forms, AI features, and anything that sends email or SMS have rate limits and a spending cap." },
          { text: "Dependencies are reviewed, up to date, and every package name is one you can find on its official page." },
          { text: "Error messages shown to users do not reveal code, file paths, or database details." },
          { text: "There is a backup of the database, and you know how to restore it." },
        ],
      },
      { type: "h2", text: "When to bring in someone technical" },
      {
        type: "p",
        text: "You do not need a developer to build a prototype, test an idea, or make an internal tool that only you use. You do need a technical review once the app holds customer data, takes payments, or runs on a paid API that someone else could trigger.",
      },
      {
        type: "p",
        text: "A review is usually much cheaper than a rebuild, and far cheaper than a breach. Keep using AI to build. Just have someone check the parts it does not think about before real users arrive.",
      },
    ],
  },
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
        text: "From July to September 2026, Search Console recorded 3,260 impressions and 75 clicks from Google, at an average position of 6.6 and a click-through rate of 2.3%. Most of that period was steady at around 20 to 40 impressions a day. In the second half of September, impressions climbed past 100 a day as more pages started ranking.",
      },
      {
        type: "image",
        src: "/notes/sri-tanduk-search-console.webp",
        alt: "Google Search Console performance for Sri Tanduk from July to September 2026: 75 clicks, 3.26K impressions, 2.3% average CTR, average position 6.6",
        width: 1946,
        height: 650,
        caption: "Google Search Console, July to September 2026. Impressions in purple, clicks in blue.",
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
