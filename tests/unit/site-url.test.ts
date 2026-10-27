import { describe, expect, it } from "vitest";
import { createShareCard } from "@/lib/qr";
import { parsePublicUrl, resolveSiteUrl } from "@/lib/site-url";

describe("parsePublicUrl", () => {
  it.each([
    ["https://our-little-universe.vercel.app", "https://our-little-universe.vercel.app/"],
    ["https://example.com/birthday/", "https://example.com/birthday/"],
    ["  https://example.com?ref=qr#top  ", "https://example.com/"],
    // Vercel's system variables are bare hostnames.
    ["our-little-universe.vercel.app", "https://our-little-universe.vercel.app/"],
  ])("accepts %s", (input, expected) => {
    expect(parsePublicUrl(input)?.href).toBe(expected);
  });

  it.each([
    undefined,
    "",
    "   ",
    "not a url",
    "http://example.com",
    "ftp://example.com",
    "https://localhost:3000",
    "http://localhost:3000",
    "https://127.0.0.1",
    "https://192.168.1.20",
    "https://10.0.0.5",
    "https://172.20.1.1",
    "https://my-laptop.local",
    "https://intranet",
  ])("rejects %s", (input) => {
    expect(parsePublicUrl(input)).toBeNull();
  });
});

describe("resolveSiteUrl", () => {
  it("prefers the content file, then the env variable, then Vercel's URL", () => {
    expect(
      resolveSiteUrl({
        configured: "https://chosen.example",
        publicEnv: "https://env.example",
        vercelProduction: "auto.vercel.app",
      })?.hostname,
    ).toBe("chosen.example");
    expect(
      resolveSiteUrl({ publicEnv: "https://env.example", vercelProduction: "auto.vercel.app" })
        ?.hostname,
    ).toBe("env.example");
    expect(resolveSiteUrl({ vercelProduction: "auto.vercel.app" })?.hostname).toBe(
      "auto.vercel.app",
    );
  });

  it("skips untrustworthy values instead of using them", () => {
    expect(
      resolveSiteUrl({ configured: "http://localhost:3000", vercelProduction: "auto.vercel.app" })
        ?.hostname,
    ).toBe("auto.vercel.app");
    expect(resolveSiteUrl({})).toBeNull();
  });
});

describe("createShareCard", () => {
  it("returns nothing when no public URL is known", () => {
    expect(createShareCard(null)).toBeNull();
  });

  it("encodes the public URL as SVG path data", () => {
    const card = createShareCard(new URL("https://our-little-universe.vercel.app"));
    expect(card?.url).toBe("https://our-little-universe.vercel.app/");
    expect(card?.qrSize).toBeGreaterThanOrEqual(21);
    expect(card?.qrPath).toMatch(/^M\d+ \d+h\d+v1h-\d+z/);
  });

  it("is deterministic", () => {
    const url = new URL("https://example.com");
    expect(createShareCard(url)).toEqual(createShareCard(url));
  });
});
