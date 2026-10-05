import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function audit(page: Page) {
  // Let enter animations finish; axe measures colour mid-fade otherwise.
  await page.waitForTimeout(500);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations.map((v) => `${v.impact} ${v.id}: ${v.help} (${v.nodes.length}) ${v.nodes[0]?.target}`)).toEqual([]);
}

const ROUTES = ["/", "/student", "/educator", "/educator/mateo-hernandez", "/educator/ethan-park", "/educator/eli-goldberg/family", "/admin", "/system", "/accessibility", "/about"];

for (const route of ROUTES) {
  test(`${route} has no axe violations`, async ({ page }) => {
    await page.goto(route);
    await audit(page);
  });
}

test.beforeEach(async ({ page }) => {
  // Speech is not available headless; stub it so the player behaves as it would.
  await page.addInitScript(() => {
    // @ts-expect-error test stub
    window.speechSynthesis = { speak: () => {}, cancel: () => {} };
  });
});

test("player states have no axe violations", async ({ page }) => {
  await page.goto("/student");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await audit(page); // practice item
  await page.getByRole("button", { name: "Cross out", exact: true }).click();
  await page.getByRole("button", { name: "Cross out A" }).click();
  await audit(page); // eliminator on, one crossed out
  await page.getByRole("button", { name: "Contrast" }).click();
  await audit(page); // high contrast
  await page.getByRole("button", { name: "Take a break" }).click();
  await expect(page.getByRole("heading", { name: "Rest time" })).toBeVisible();
  await audit(page);
});

test("Spanish family report has no axe violations and sets the page language", async ({ page }) => {
  await page.goto("/educator/mateo-hernandez/family");
  await page.getByText("Español").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await audit(page);
});

test("Accessibility Lens layers have no axe violations on the page underneath", async ({ page }) => {
  await page.goto("/educator");
  await page.getByRole("button", { name: /Accessibility Lens/ }).click();
  await page.getByRole("button", { name: "Turn on all layers" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-lens", /landmarks/);
  await audit(page);
});

test("works with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/student");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByRole("radio", { name: /doghouse/ })).toBeAttached();
});
