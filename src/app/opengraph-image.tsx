import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

/* The homepage share card. Generated from the same template as every other
   route rather than shipped as a fixed PNG, so it can never fall behind the
   site the way a hand-made image does. */
export const alt = "zakrulabd — web development and digital marketing in Malaysia";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    eyebrow: "FREELANCE WEB DEVELOPER",
    title: "Websites built to perform, and easy to find on Google",
    note: "React, Laravel and WordPress builds, technical SEO, GA4 and automation",
  });
}
