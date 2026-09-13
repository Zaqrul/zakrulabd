import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Terms & Conditions";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    eyebrow: "LEGAL & TERMS",
    title: "Terms & Conditions",
    note: "Scope, milestones, ownership, and warranty",
  });
}
