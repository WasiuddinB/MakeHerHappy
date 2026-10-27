import QRCode from "qrcode";

export interface ShareCard {
  url: string;
  /** SVG path data for the QR code's dark modules. */
  qrPath: string;
  /** Width/height of the QR code in modules, excluding the quiet zone. */
  qrSize: number;
}

/**
 * Builds the share QR code at build time, as plain SVG path data — no
 * client-side library needed. Returns null when there is no verified
 * public URL, so a QR code can never point somewhere invented.
 */
export function createShareCard(siteUrl: URL | null): ShareCard | null {
  if (!siteUrl) return null;

  const url = siteUrl.href;
  const { modules } = QRCode.create(url, { errorCorrectionLevel: "M" });

  // One path segment per horizontal run of dark modules keeps the SVG small.
  let path = "";
  for (let row = 0; row < modules.size; row++) {
    let col = 0;
    while (col < modules.size) {
      if (!modules.get(row, col)) {
        col++;
        continue;
      }
      const start = col;
      while (col < modules.size && modules.get(row, col)) col++;
      path += `M${start} ${row}h${col - start}v1h-${col - start}z`;
    }
  }

  return { url, qrPath: path, qrSize: modules.size };
}
