import { expect, test, type Page } from "@playwright/test";

/** Fails the test on any console error or uncaught exception. */
function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(String(error)));
  return errors;
}

async function inViewport(page: Page, selector: string) {
  return page.locator(selector).evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("greets her, with a title and no errors", async ({ page }) => {
  const errors = trackErrors(page);
  await page.reload();
  await expect(page).toHaveTitle("A Little Universe, Just for You");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Happy birthday,");
  await expect(page.getByRole("button", { name: "Open your little surprise" })).toBeVisible();
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});

test("the opening button leads into the experience", async ({ page }) => {
  await page.getByRole("button", { name: "Open your little surprise" }).click();
  await expect.poll(() => inViewport(page, "#countdown")).toBe(true);
  await expect(page.locator("#countdown-title")).toBeFocused();
});

test("'Our little story' jumps to the timeline", async ({ page }) => {
  await page.getByRole("link", { name: "Our little story" }).click();
  await expect.poll(() => inViewport(page, "#story")).toBe(true);
});

test("the chapter menu navigates to any section", async ({ page }) => {
  await page.getByRole("button", { name: "Chapters" }).click();
  const menu = page.getByRole("dialog", { name: "Chapters" });
  await expect(menu).toBeVisible();
  await menu.getByRole("link", { name: /Make a wish/ }).click();
  await expect(menu).toBeHidden();
  await expect.poll(() => inViewport(page, "#cake")).toBe(true);
});

test("the letter opens and can be read", async ({ page }) => {
  await page.getByRole("button", { name: "Open the letter" }).click();
  const letter = page.getByRole("article");
  await expect(letter).toBeVisible();
  await expect(letter).toContainText("Forever and always yours");
  await expect(letter).toBeFocused();
});

test("an adoration card turns over", async ({ page }) => {
  await page.getByRole("button", { name: "Read why: Your smile" }).click();
  await expect(page.getByRole("button", { name: "Turn back: Your smile" })).toBeFocused();
});

test("the photo viewer opens, navigates and closes", async ({ page }) => {
  const thumbnails = page.getByRole("button", { name: /open larger/ });
  await thumbnails.first().click();
  const viewer = page.getByRole("dialog", { name: "Our first photo together" });
  await expect(viewer).toBeVisible();
  await expect(viewer.getByText("Photo 1 of 8")).toBeVisible();

  await page.keyboard.press("ArrowRight");
  // The dialog is named by its caption, which changes with the photo.
  await expect(page.getByRole("dialog", { name: "A favorite trip" })).toBeVisible();
  await expect(page.getByRole("dialog").getByText("Photo 2 of 8")).toBeVisible();

  // Background scrolling is locked while it's open.
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe(
    "hidden",
  );

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(thumbnails.first()).toBeFocused();
});

test("an 'open when' note opens and another can follow", async ({ page }) => {
  await page.getByRole("button", { name: /Open when you need a smile/ }).click();
  const note = page.getByRole("dialog", { name: "Open when you need a smile" });
  await expect(note).toBeVisible();
  await note.getByRole("button", { name: "Open another" }).click();
  await expect(
    page.getByRole("dialog", { name: "Open when your day feels difficult" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close note" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("a surprise can be chosen, and the others explored", async ({ page }) => {
  await page.getByRole("button", { name: /Something sweet/ }).click();
  await expect(page.getByRole("heading", { name: "A little something sweet" })).toBeFocused();
  await page.getByRole("button", { name: "Choose another surprise" }).click();
  await expect(page.getByRole("button", { name: /Something funny/ })).toBeVisible();
});

test("the candles blow out and the celebration can be repeated", async ({ page }) => {
  await page.getByRole("button", { name: "Blow out the candles" }).click();
  await expect(page.getByRole("heading", { name: "Your wish is on its way" })).toBeVisible();
  await page.getByRole("button", { name: "Light the candles again" }).click();
  await expect(page.getByRole("button", { name: "Blow out the candles" })).toBeFocused();
});

test("the final reveal unfolds", async ({ page }) => {
  await page.getByRole("button", { name: "One last little thing" }).click();
  await expect(
    page.locator("#finale").getByRole("heading", { name: /^Happy birthday/ }),
  ).toBeFocused();
  await expect(page.getByText("Here's to you, today and always.")).toBeVisible();
});

test("presentation mode can be entered, navigated and exited", async ({ page }) => {
  await page.getByRole("button", { name: "Present on a big screen" }).click();
  const controls = page.getByRole("toolbar", { name: "Presentation controls" });
  await expect(controls).toBeVisible();
  await expect(page.getByRole("banner")).toBeHidden();

  await page.keyboard.press("ArrowRight");
  await expect(controls).toContainText("2 / 10");
  await expect.poll(() => inViewport(page, "#countdown")).toBe(true);

  await controls.getByRole("button", { name: "Next chapter" }).click();
  await expect(controls).toContainText("3 / 10");

  await page.keyboard.press("Escape");
  await expect(controls).toBeHidden();
  await expect(page.getByRole("banner")).toBeVisible();
});

test("?present opens straight into presentation mode", async ({ page }) => {
  await page.goto("/?present");
  await expect(page.getByRole("toolbar", { name: "Presentation controls" })).toBeVisible();
});

test("keyboard users can skip to the content", async ({ page }) => {
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
});

test("unknown pages show a friendly 404", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: /drifted off among the stars/ })).toBeVisible();
  await page.getByRole("link", { name: "Take me home" }).click();
  await expect(page).toHaveURL("/");
});
