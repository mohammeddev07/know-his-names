import { ImageResponse } from "next/og";
import { starPoints } from "@/components/ui/star";
import { SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME}: learn and remember the 99 Names of Allah`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Required for `output: "export"` (GitHub Pages review builds); this image
// has no dynamic input, so it's already effectively static on Vercel too.
export const dynamic = "force-static";

const STAR = starPoints(240, 12);

/** Shared preview image for links to the site. */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        padding: "0 96px",
        gap: 72,
        background: "#0e5a44",
        color: "#f8f4e9",
      }}
    >
      <svg width="240" height="240" viewBox="0 0 240 240">
        <polygon
          points={STAR}
          fill="none"
          stroke="#f8f4e9"
          strokeWidth="10"
          strokeLinejoin="round"
        />
        <circle cx="120" cy="120" r="16" fill="#c9a964" />
      </svg>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 84, letterSpacing: -2, lineHeight: 1 }}>
          {SITE_NAME}
        </div>
        <div style={{ fontSize: 36, marginTop: 24, color: "#e3c98d" }}>
          Learn. Remember. Reflect.
        </div>
        <div
          style={{
            fontSize: 30,
            marginTop: 28,
            maxWidth: 640,
            lineHeight: 1.35,
            color: "rgba(248, 244, 233, 0.82)",
          }}
        >
          The 99 Names of Allah, with active recall and spaced repetition.
        </div>
      </div>
    </div>,
    size,
  );
}
