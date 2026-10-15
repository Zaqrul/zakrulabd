import { tech, type TechKey } from "@/lib/tech";

/* Copy names tools in prose ("GA4 setup & reporting", "React & Laravel apps"),
   and the UI marks those mentions with the tool's own logo. Rather than tagging
   every string by hand in content.ts, the text is matched against this table,
   so a line rewritten later keeps its marks without anyone remembering to. */
const aliases: Record<TechKey, string[]> = {
  react: ["React"],
  reactNative: ["React Native"],
  expo: ["Expo"],
  next: ["Next.js", "NextJS"],
  astro: ["Astro"],
  typescript: ["TypeScript"],
  javascript: ["JavaScript"],
  dart: ["Dart"],
  python: ["Python"],
  cpp: ["C++"],
  php: ["PHP"],
  laravel: ["Laravel"],
  codeigniter: ["CodeIgniter"],
  tailwind: ["Tailwind CSS", "Tailwind"],
  figma: ["Figma"],
  storybook: ["Storybook"],
  mysql: ["MySQL"],
  sqlServer: ["SQL Server"],
  supabase: ["Supabase"],
  firebase: ["Firebase"],
  tawkto: ["Tawk.to", "Tawk"],
  n8n: ["n8n"],
  brevo: ["Brevo"],
  geo: ["Generative Engine Optimization", "GEO"],
  vercel: ["Vercel"],
  railway: ["Railway"],
  cloudflare: ["Cloudflare"],
  ga4: ["Google Analytics 4", "Google Analytics", "GA4"],
  searchConsole: ["Google Search Console", "Search Console"],
  wordpress: ["WordPress"],
  shopify: ["Shopify"],
  stripe: ["Stripe"],
  git: ["Git"],
  github: ["GitHub"],
  vscode: ["VS Code", "Visual Studio Code"],
  antigravity: ["Antigravity"],
  claudeCode: ["Claude Code"],
  codex: ["Codex", "ChatGPT"],
  gemini: ["Gemini"],
  lmStudio: ["LM Studio"],
};

/* Longest alias first so "Google Analytics 4" is not claimed by "Google
   Analytics", and "GitHub" is never read as "Git". */
const table = (Object.entries(aliases) as [TechKey, string[]][])
  .flatMap(([key, names]) => names.map((name) => ({ key, name })))
  .sort((a, b) => b.name.length - a.name.length);

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Every tool named in the text, in the order the names appear. */
export function findTechMentions(text: string, limit = 3): TechKey[] {
  const found: { key: TechKey; at: number }[] = [];
  /* Characters already claimed by a longer alias, so "GitHub" cannot also
     report Git and "Tailwind CSS" cannot also report Tailwind. */
  let remaining = text;

  for (const { key, name } of table) {
    if (found.some((f) => f.key === key)) continue;
    const pattern = new RegExp(`(^|[^A-Za-z0-9])${escape(name)}($|[^A-Za-z0-9])`, "i");
    const match = pattern.exec(remaining);
    if (!match) continue;

    found.push({ key, at: match.index });
    remaining = remaining.slice(0, match.index) + " ".repeat(match[0].length) + remaining.slice(match.index + match[0].length);
  }

  return found
    .sort((a, b) => a.at - b.at)
    .slice(0, limit)
    .map((f) => f.key);
}

export { tech };
