import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Compare the Starter, Professional, and Advanced packages";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    eyebrow: "SCOPE COMPARISON",
    title: "What each package builds",
    note: "18 project types, three packages, side by side",
  });
}
