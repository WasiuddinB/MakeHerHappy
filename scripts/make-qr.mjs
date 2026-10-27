// Creates a printable QR code for the deployed site.
//
//   npm run qr -- https://your-site.vercel.app
//
// Writes share-qr.svg (crisp at any print size) and share-qr.png into the
// project folder. Only real public https addresses are accepted.
import QRCode from "qrcode";
import { parsePublicUrl } from "../src/lib/site-url.ts";

const input = process.argv[2];
const url = parsePublicUrl(input);

if (!url) {
  console.error(
    input
      ? `"${input}" isn't a public https address. Use your deployed URL, e.g. https://your-site.vercel.app`
      : "Add your deployed URL, e.g.  npm run qr -- https://your-site.vercel.app",
  );
  process.exit(1);
}

const options = {
  errorCorrectionLevel: "M",
  margin: 4,
  color: { dark: "#15112a", light: "#ffffff" },
};
await QRCode.toFile("share-qr.svg", url.href, { ...options, type: "svg" });
await QRCode.toFile("share-qr.png", url.href, { ...options, type: "png", width: 1200 });

console.log(`QR code for ${url.href} saved as share-qr.svg and share-qr.png`);
console.log("Scan it with a phone on mobile data (not Wi-Fi) to check it opens the live site.");
