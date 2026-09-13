import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/* One card design for every route, so a link to /compare is recognisably from
   the same site as a link to the homepage. Rendered at build time by Satori,
   which supports a subset of CSS: flex only, no grid, and every element that
   holds more than one child needs an explicit display value. */
export function ogImage({ eyebrow, title, note }: { eyebrow: string; title: string; note: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#171717",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        {/* Amber rule across the top, the one strong colour the site uses. */}
        <div style={{ display: "flex", width: 240, height: 10, backgroundColor: "#fbcf33" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, color: "#a3a3a3", fontWeight: 700 }}>
            {eyebrow}
          </div>
          <div style={{ display: "flex", fontSize: 68, lineHeight: 1.15, color: "#ffffff", fontWeight: 800 }}>
            {title}
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#d4d4d4" }}>{note}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 26 }}>
          <div style={{ display: "flex", color: "#ffffff", fontWeight: 700 }}>Zakrul</div>
          <div style={{ display: "flex", color: "#fbcf33", fontWeight: 700 }}>zakrul.com</div>
        </div>
      </div>
    ),
    OG_SIZE
  );
}
