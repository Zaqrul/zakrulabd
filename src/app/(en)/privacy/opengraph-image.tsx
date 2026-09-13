import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Privacy Policy";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    eyebrow: "LEGAL & PRIVACY",
    title: "Privacy Policy",
    note: "What I collect, why, and how it is protected under the PDPA",
  });
}
