/**
 * Working out the site's real public URL.
 *
 * It's used for absolute metadata URLs and — importantly — for the share
 * QR code, which must never point at an invented domain or at localhost.
 * If no trustworthy public URL is known, callers get `null` and simply
 * don't render a QR code.
 */

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /\.localhost$/i,
  /\.local$/i,
  /\.internal$/i,
  /^0\.0\.0\.0$/,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
  /^\[?::1\]?$/,
];

/**
 * Parses `value` as a public https URL. Returns null for anything that
 * isn't one: empty strings, malformed URLs, http, localhost, LAN
 * addresses and single-label hosts.
 */
export function parsePublicUrl(value: string | undefined | null): URL | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    // Vercel's system variables are bare hostnames ("x.vercel.app").
    url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  if (url.protocol !== "https:") return null;
  const host = url.hostname;
  if (!host.includes(".") || PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(host))) {
    return null;
  }

  // Canonical form: origin plus path, no query or fragment.
  url.search = "";
  url.hash = "";
  return url;
}

export interface SiteUrlSources {
  /** `site.url` from the content file. */
  configured?: string;
  /** NEXT_PUBLIC_SITE_URL */
  publicEnv?: string;
  /** VERCEL_PROJECT_PRODUCTION_URL (set automatically on Vercel). */
  vercelProduction?: string;
}

/** The first trustworthy public URL, in priority order, or null. */
export function resolveSiteUrl(sources: SiteUrlSources): URL | null {
  return (
    parsePublicUrl(sources.configured) ??
    parsePublicUrl(sources.publicEnv) ??
    parsePublicUrl(sources.vercelProduction)
  );
}

/** Resolves the site URL from the content file and the build environment. */
export function getSiteUrl(configured: string | undefined): URL | null {
  return resolveSiteUrl({
    configured,
    publicEnv: process.env.NEXT_PUBLIC_SITE_URL,
    vercelProduction: process.env.VERCEL_PROJECT_PRODUCTION_URL,
  });
}
