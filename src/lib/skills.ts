import type { TechKey } from "@/lib/tech";

/* Self-rated proficiency for the About page, out of 5. Each entry points at
   the shared tech registry so the name, icon, and brand colour stay in one place. */
export type SkillGroup = { label: { en: string; ms: string }; skills: { key: TechKey; level: 1 | 2 | 3 | 4 | 5 }[] };

export const SKILL_MAX = 5;

export const skillGroups: SkillGroup[] = [
  {
    label: { en: "Languages", ms: "Bahasa pengaturcaraan" },
    skills: [
      { key: "javascript", level: 5 },
      { key: "typescript", level: 4 },
      { key: "php", level: 4 },
      { key: "python", level: 3 },
      { key: "dart", level: 2 },
      { key: "cpp", level: 2 },
    ],
  },
  {
    label: { en: "Frontend and mobile", ms: "Frontend dan mudah alih" },
    skills: [
      { key: "react", level: 5 },
      { key: "next", level: 5 },
      { key: "tailwind", level: 5 },
      { key: "astro", level: 3 },
      { key: "reactNative", level: 3 },
      { key: "expo", level: 3 },
    ],
  },
  {
    label: { en: "Backend and CMS", ms: "Backend dan CMS" },
    skills: [
      { key: "laravel", level: 4 },
      { key: "codeigniter", level: 3 },
      { key: "wordpress", level: 5 },
      { key: "shopify", level: 3 },
      { key: "stripe", level: 3 },
    ],
  },
  {
    label: { en: "Databases", ms: "Pangkalan data" },
    skills: [
      { key: "mysql", level: 4 },
      { key: "supabase", level: 4 },
      { key: "sqlServer", level: 3 },
      { key: "firebase", level: 3 },
    ],
  },
  {
    label: { en: "Marketing and automation", ms: "Pemasaran dan automasi" },
    skills: [
      { key: "ga4", level: 5 },
      { key: "searchConsole", level: 5 },
      { key: "tawkto", level: 4 },
      { key: "n8n", level: 3 },
    ],
  },
  {
    label: { en: "Hosting and tools", ms: "Hosting dan alatan" },
    skills: [
      { key: "vercel", level: 5 },
      { key: "github", level: 5 },
      { key: "cloudflare", level: 4 },
      { key: "railway", level: 3 },
      { key: "figma", level: 3 },
    ],
  },
];
