import type { Metadata, Viewport } from "next";
import { Caveat, DM_Sans, Fraunces } from "next/font/google";
import { birthday } from "@/content/birthday";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

// Fonts are downloaded at build time and served from this site — visitors'
// browsers never contact Google.
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  // Optical sizing gives the refined display cut at headline sizes. (The
  // extra SOFT axis would nearly double the download for a subtle effect.)
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-caveat",
  display: "swap",
  // Decorative accents only — don't compete with the headline fonts.
  preload: false,
});

const { site } = birthday;
const siteUrl = getSiteUrl(site.url);

export const metadata: Metadata = {
  metadataBase: siteUrl ?? undefined,
  title: site.title,
  description: site.description,
  applicationName: site.title,
  robots: site.allowSearchIndexing
    ? { index: true, follow: true }
    : { index: false, follow: false, googleBot: { index: false, follow: false } },
  openGraph: {
    type: "website",
    title: site.title,
    description: site.description,
    siteName: site.title,
    url: siteUrl?.href,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#fbf6ef",
  colorScheme: "only light",
  viewportFit: "cover",
};

// Fail the build if anything ever makes the site non-static.
export const ensureStatic = "navigation";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={site.language}
      className={`${fraunces.variable} ${dmSans.variable} ${caveat.variable}`}
    >
      <body className="min-h-svh bg-ivory text-ink">
        <a
          href="#main"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-rose-700 px-5 py-3 text-sm font-semibold text-paper shadow-lift transition-transform focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
