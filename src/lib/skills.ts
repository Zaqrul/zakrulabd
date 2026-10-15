import type { TechKey } from "@/lib/tech";

/* Self-rated proficiency for the About page, out of 5. Each entry points at
   the shared tech registry so the name, icon, and brand colour stay in one place.
   Level 1 shows a "Still learning" label instead of stars. */
export type SkillGroup = { label: { en: string; ms: string }; skills: { key: TechKey; level: 1 | 2 | 3 | 4 | 5 }[] };

export const SKILL_MAX = 5;

export const skillGroups: SkillGroup[] = [
  {
    label: { en: "Languages", ms: "Bahasa pengaturcaraan" },
    skills: [
      { key: "javascript", level: 4 },
      { key: "typescript", level: 3 },
      { key: "php", level: 3 },
      { key: "python", level: 2 },
      { key: "dart", level: 1 },
      { key: "cpp", level: 1 },
    ],
  },
  {
    label: { en: "Frontend and mobile", ms: "Frontend dan mudah alih" },
    skills: [
      { key: "react", level: 4 },
      { key: "next", level: 4 },
      { key: "tailwind", level: 4 },
      { key: "astro", level: 2 },
      { key: "reactNative", level: 2 },
      { key: "expo", level: 2 },
    ],
  },
  {
    label: { en: "Backend and CMS", ms: "Backend dan CMS" },
    skills: [
      { key: "laravel", level: 3 },
      { key: "codeigniter", level: 3 },
      { key: "wordpress", level: 4 },
      { key: "shopify", level: 2 },
      { key: "stripe", level: 2 },
    ],
  },
  {
    label: { en: "Databases", ms: "Pangkalan data" },
    skills: [
      { key: "mysql", level: 3 },
      { key: "supabase", level: 3 },
      { key: "sqlServer", level: 2 },
      { key: "firebase", level: 2 },
    ],
  },
  {
    label: { en: "Marketing and automation", ms: "Pemasaran dan automasi" },
    skills: [
      { key: "ga4", level: 3 },
      { key: "searchConsole", level: 3 },
      { key: "geo", level: 2 },
      { key: "tawkto", level: 3 },
      { key: "brevo", level: 3 },
      { key: "n8n", level: 2 },
    ],
  },
  {
    label: { en: "Hosting and tools", ms: "Hosting dan alatan" },
    skills: [
      { key: "vercel", level: 4 },
      { key: "github", level: 4 },
      { key: "cloudflare", level: 3 },
      { key: "railway", level: 2 },
      { key: "figma", level: 2 },
    ],
  },
  {
    label: { en: "Editors and IDEs", ms: "Editor dan IDE" },
    skills: [
      { key: "vscode", level: 4 },
      { key: "antigravity", level: 3 },
    ],
  },
  {
    label: { en: "AI tools", ms: "Alatan AI" },
    skills: [
      { key: "claudeCode", level: 4 },
      { key: "codex", level: 3 },
      { key: "gemini", level: 3 },
      { key: "lmStudio", level: 2 },
    ],
  },
];
