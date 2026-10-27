import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon for iPhones and iPads (generated at build time). */
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #fdf3f0 0%, #f3cfc6 100%)",
      }}
    >
      <svg width="124" height="124" viewBox="0 0 64 64">
        <path
          d="M32 51s-15.5-9.4-19.7-18.9C9.2 24.3 13.8 16 21.8 16c4.4 0 7.4 2.3 10.2 6.2 2.8-3.9 5.8-6.2 10.2-6.2 8 0 12.6 8.3 9.5 16.1C47.5 41.6 32 51 32 51Z"
          fill="#9d4a5c"
        />
        <path
          d="M49 6c.7 4.3 2.2 5.8 6.5 6.5-4.3.7-5.8 2.2-6.5 6.5-.7-4.3-2.2-5.8-6.5-6.5 4.3-.7 5.8-2.2 6.5-6.5Z"
          fill="#ecc681"
        />
      </svg>
    </div>,
    size,
  );
}
