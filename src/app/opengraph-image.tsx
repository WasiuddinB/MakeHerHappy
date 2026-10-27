import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { birthday } from "@/content/birthday";

/* The link-preview card (WhatsApp, iMessage, Messenger…). It only uses the
 * generic site title and description — no names, photos or messages. */

export const alt = birthday.site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ImageResponse can't read WOFF2, so small WOFF copies live in src/assets.
// Read once at module scope (awaited here, not in the handler) so the image
// is reliably generated at build time.
const fonts = join(process.cwd(), "src/assets/fonts");
const [displayFont, textFont] = await Promise.all([
  readFile(join(fonts, "fraunces-latin-400-italic.woff")),
  readFile(join(fonts, "dm-sans-latin-500-normal.woff")),
]);

const STARS = [
  [100, 52.5, 6],
  [142.3, 14.4, 5],
  [187.3, 50.7, 4.4],
  [156.6, 110.7, 5],
  [100, 173.5, 6.4],
  [43.4, 110.7, 5],
  [12.7, 50.7, 4.4],
  [57.7, 14.4, 5],
] as const;

function sparkle(x: number, y: number, r: number) {
  const c = r * 0.16;
  return `M${x} ${y - r}C${x + c} ${y - c} ${x + c} ${y - c} ${x + r} ${y}C${x + c} ${y + c} ${x + c} ${y + c} ${x} ${y + r}C${x - c} ${y + c} ${x - c} ${y + c} ${x - r} ${y}C${x - c} ${y - c} ${x - c} ${y - c} ${x} ${y - r}Z`;
}

export default function OpenGraphImage() {
  const outline = `M${STARS.map(([x, y]) => `${x} ${y}`).join("L")}Z`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fbf6ef",
        backgroundImage:
          "radial-gradient(circle at 12% 12%, #fbe4d3 0%, rgba(251,228,211,0) 42%), radial-gradient(circle at 88% 88%, #ede5f7 0%, rgba(237,229,247,0) 45%), radial-gradient(circle at 50% 45%, #fdf3f0 0%, rgba(253,243,240,0) 60%)",
      }}
    >
      <svg width="150" height="143" viewBox="-10 -10 220 210">
        <path d={outline} fill="none" stroke="#bd6b78" strokeOpacity="0.55" strokeWidth="1.4" />
        {STARS.map(([x, y, r], index) => (
          <path
            key={index}
            d={sparkle(x, y, r * 1.7)}
            fill={index % 2 === 0 ? "#9d4a5c" : "#bd6b78"}
          />
        ))}
      </svg>
      <div
        style={{
          marginTop: 34,
          fontFamily: "DM Sans",
          fontSize: 24,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: "#7f3449",
        }}
      >
        Happy birthday
      </div>
      <div
        style={{
          marginTop: 18,
          // Narrow enough to break as "A Little Universe, / Just for You".
          maxWidth: 820,
          fontFamily: "Fraunces",
          fontStyle: "italic",
          fontSize: 86,
          lineHeight: 1.06,
          textAlign: "center",
          color: "#3b2631",
        }}
      >
        {birthday.site.title}
      </div>
      <div style={{ marginTop: 26, fontFamily: "DM Sans", fontSize: 28, color: "#64505a" }}>
        {birthday.site.description}
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Fraunces", data: displayFont, style: "italic", weight: 400 },
        { name: "DM Sans", data: textFont, style: "normal", weight: 500 },
      ],
    },
  );
}
