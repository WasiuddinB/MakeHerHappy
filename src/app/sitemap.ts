import type { MetadataRoute } from "next";
import { birthday } from "@/content/birthday";
import { getSiteUrl } from "@/lib/site-url";

/** Lists the page only when search indexing is switched on and the URL is known. */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl(birthday.site.url);
  if (!birthday.site.allowSearchIndexing || !siteUrl) return [];
  return [{ url: siteUrl.href, changeFrequency: "yearly", priority: 1 }];
}
