import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load the homepage successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Aurora Social/i);
  });

  test("should have proper page structure", async ({ page }) => {
    await page.goto("/");
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});
