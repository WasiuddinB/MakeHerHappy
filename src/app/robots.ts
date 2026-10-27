import type { MetadataRoute } from "next";
import { birthday } from "@/content/birthday";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl(birthday.site.url);
  return {
    // Crawling stays open so link previews (WhatsApp, iMessage, Messenger…)
    // can read the page. The `noindex` in the page metadata is what asks
    // search engines not to list it — see `site.allowSearchIndexing`.
    rules: { userAgent: "*", allow: "/" },
    sitemap:
      birthday.site.allowSearchIndexing && siteUrl
        ? new URL("/sitemap.xml", siteUrl).href
        : undefined,
  };
}
