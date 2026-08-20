import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Notes from real client projects";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    eyebrow: "NOTES",
    title: "How the work actually gets done",
    note: "Write-ups of real client projects",
  });
}
