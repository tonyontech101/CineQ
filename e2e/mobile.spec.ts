import { test, expect } from "@playwright/test";

// Mobile smoke tests. They verify the mobile-specific behavior we hardened:
// the nav drawer and the "Where to watch" bottom sheet open/close correctly,
// and the floating chat launcher is hidden while an overlay is open (so it
// doesn't paint on top of the sheet in the bottom-right corner).

test.describe("mobile navigation drawer", () => {
  test("opens, hides the chat launcher, and closes", async ({ page }) => {
    await page.goto("/");

    const launcher = page.getByRole("button", { name: "Open recommendation assistant" });
    await expect(launcher).toBeVisible();

    // Open the hamburger drawer.
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();

    // The drawer must fill the viewport height. (Regression guard: a
    // backdrop-filter ancestor previously trapped the fixed overlay inside the
    // 64px header, leaving the panel background covering only a top strip.)
    const box = await drawer.boundingBox();
    const vh = page.viewportSize()!.height;
    expect(box!.height).toBeGreaterThan(vh * 0.9);

    // Fix #1: the launcher must not float over the drawer.
    await expect(launcher).toBeHidden();

    // Close via Escape and confirm the launcher comes back.
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await expect(launcher).toBeVisible();
  });
});

test.describe("watch-on bottom sheet", () => {
  test("opens as a sheet and hides the chat launcher", async ({ page }) => {
    // Mock-mode movie detail always exists for id 1.
    await page.goto("/movie/1");

    const launcher = page.getByRole("button", { name: "Open recommendation assistant" });
    await expect(launcher).toBeVisible();

    await page.getByRole("button", { name: /watch on/i }).first().click();

    await expect(page.getByRole("heading", { name: "Where to watch" })).toBeVisible();

    // Fix #1: launcher hidden behind the sheet.
    await expect(launcher).toBeHidden();

    // Close and confirm restoration.
    await page.keyboard.press("Escape");
    await expect(page.getByRole("heading", { name: "Where to watch" })).toBeHidden();
    await expect(launcher).toBeVisible();
  });
});

test.describe("layout", () => {
  test("declares a responsive viewport and has no horizontal overflow", async ({ page }) => {
    await page.goto("/");

    // Fix #4: explicit viewport meta.
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute("content", /width=device-width/);

    // No horizontal scroll on a phone-width screen.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1); // allow sub-pixel rounding
  });
});
