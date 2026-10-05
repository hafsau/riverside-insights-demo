import { expect, test } from "@playwright/test";

const ROUTES = ["/", "/student", "/educator", "/educator/mateo-hernandez", "/admin", "/system", "/accessibility", "/about"];

for (const route of ROUTES) {
  test(`${route} has no page-level horizontal scroll`, async ({ page }) => {
    await page.goto(route);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test("mobile menu opens and lists every role", async ({ page, viewport }) => {
  test.skip(!viewport || viewport.width >= 1024, "desktop shows the full nav");
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  for (const name of ["Student", "Educator", "Admin"]) await expect(page.locator("#mobile-nav").getByRole("link", { name })).toBeVisible();
});
