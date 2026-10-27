import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test.describe("layout", () => {
  for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1920]) {
    test(`no sideways scrolling at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      // Open everything that changes size, then measure.
      await page.getByRole("button", { name: "Open the letter" }).click();
      await page.getByRole("button", { name: /Reveal them all/ }).click();
      await page.getByRole("button", { name: "One last little thing" }).click();
      await page.waitForTimeout(800);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

test.describe("accessibility (axe, WCAG 2.2 AA)", () => {
  test("the page has no detectable violations", async ({ page }) => {
    await page.goto("/");
    // Settle entrance animations so colours are measured at rest.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForTimeout(300);
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
  });

  test("open dialogs and revealed content have no violations", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.getByRole("button", { name: "Open the letter" }).click();
    await page.getByRole("button", { name: /Reveal them all/ }).click();
    await page.getByRole("button", { name: "One last little thing" }).click();
    await page.getByRole("button", { name: /Open when you need a smile/ }).click();
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("decorations stay still and everything still works", async ({ page }) => {
    await page.goto("/");
    const petalAnimation = await page
      .locator(".petal")
      .first()
      .evaluate((element) => getComputedStyle(element).animationName);
    expect(petalAnimation).toBe("none");

    // The letter opens immediately rather than after an animation.
    await page.getByRole("button", { name: "Open the letter" }).click();
    await expect(page.getByRole("article")).toBeVisible({ timeout: 300 });

    // Nothing is left hidden waiting for a scroll animation.
    const hidden = await page.locator('[data-reveal="pending"]').count();
    expect(hidden).toBe(0);
  });
});

test.describe("countdown", () => {
  test("counts down before the birthday", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-08T17:59:30Z"));
    await page.goto("/");
    const countdown = page.locator("#countdown");
    await expect(countdown.getByRole("heading", { level: 2 })).toHaveText(
      "Counting down to your day",
    );
    await expect(countdown.getByRole("timer")).toContainText("30");
  });

  test("celebrates on the day itself (midnight in Dhaka)", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-08T18:00:00Z"));
    await page.goto("/");
    const countdown = page.locator("#countdown");
    await expect(countdown.getByRole("heading", { level: 2 })).toHaveText("Today is all about you");
    await expect(countdown.getByRole("timer")).toHaveCount(0);
  });

  test("never shows a stale countdown after the birthday", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2027-02-14T12:00:00Z"));
    await page.goto("/");
    const countdown = page.locator("#countdown");
    await expect(countdown.getByRole("heading", { level: 2 })).toHaveText("Still celebrating you");
    await expect(countdown.getByRole("timer")).toHaveCount(0);
  });

  test("ticks live, without a reload", async ({ page }) => {
    await page.clock.install({ time: new Date("2026-11-08T17:59:50Z") });
    await page.goto("/");
    const countdown = page.locator("#countdown");
    await expect(countdown.getByRole("heading", { level: 2 })).toHaveText(
      "Counting down to your day",
    );
    await page.clock.runFor(11_000);
    await expect(countdown.getByRole("heading", { level: 2 })).toHaveText("Today is all about you");
  });
});

test.describe("metadata", () => {
  test("is ready for link previews without exposing personal details", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      "A Little Universe, Just for You",
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator('link[rel="icon"]').first()).toHaveAttribute("href", /icon/);

    const og = await request.get("/opengraph-image");
    expect(og.status()).toBe(200);
    expect(og.headers()["content-type"]).toContain("image/png");

    const robots = await request.get("/robots.txt");
    expect(await robots.text()).toContain("Allow: /");
  });
});
