import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    // @ts-expect-error test stub
    window.speechSynthesis = { speak: () => {}, cancel: () => {} };
  });
});

const ANSWERS = [/B: doghouse/, /C: grapes/, /B: 4 moons/, /B: 7 beads/, /C: small solid square/, /B: two holes near the top/];

test("a student can finish the whole session with the keyboard alone", async ({ page }) => {
  await page.goto("/student");
  await page.getByRole("button", { name: "Start", exact: true }).focus();
  await page.keyboard.press("Enter");
  for (const answer of ANSWERS) {
    // Focus lands on the item heading; Tab reaches the choice group.
    const radio = page.getByRole("radio", { name: answer });
    await radio.focus();
    await page.keyboard.press("Space");
    await expect(radio).toBeChecked();
    await page.getByRole("button", { name: /^(Next|Finish)/ }).focus();
    await page.keyboard.press("Enter");
  }
  await expect(page.getByRole("heading", { name: /You did it/ })).toBeVisible();
  await expect(page.getByText("5 of 5 correct")).toBeVisible();
});

test("practice gives feedback and blocks Next until correct", async ({ page }) => {
  await page.goto("/student");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.getByRole("radio", { name: /A: bone/ }).check({ force: true });
  await expect(page.getByText("Not quite")).toBeVisible();
  await expect(page.getByRole("button", { name: /^Next/ })).toBeDisabled();
  await page.getByRole("radio", { name: /B: doghouse/ }).check({ force: true });
  await expect(page.getByText("You've got it")).toBeVisible();
  await expect(page.getByRole("button", { name: /^Next/ })).toBeEnabled();
});

test("Spanish directions follow the student into the player", async ({ page }) => {
  await page.goto("/student");
  await page.getByLabel("Testing as").selectOption("mateo-hernandez");
  await page.getByRole("button", { name: "Empezar" }).click();
  await expect(page.getByText(/Vamos a practicar/)).toBeVisible();
});

test("an accommodation assigned in admin shows in the player and footnotes the report", async ({ page }) => {
  await page.goto("/admin");
  await page.getByRole("button", { name: "All students" }).click();
  await page.getByRole("checkbox", { name: "Extended time for Grace Liu" }).check();
  await expect(page.getByRole("status").filter({ hasText: "Extended time assigned to Grace" })).toContainText("footnote");

  await page.goto("/student");
  await page.getByLabel("Testing as").selectOption("grace-liu");
  await expect(page.getByText("Time limits ×1.5")).toBeVisible();

  await page.goto("/educator/grace-liu");
  await expect(page.getByRole("complementary", { name: "Testing conditions and screening" })).toContainText("Extended time");
  await expect(page.getByText("Score footnoted")).toBeVisible();
});

test("the screening rule is shared between admin and educator", async ({ page }) => {
  await page.goto("/educator");
  await expect(page.getByRole("heading", { name: "7 to review" })).toBeVisible();
  await expect(page.getByText(/composite-only rule would miss Mateo and Santiago/)).toBeVisible();

  await page.goto("/admin");
  await page.getByRole("radio", { name: "National" }).check({ force: true });
  await page.goto("/educator");
  await expect(page.getByRole("heading", { name: "2 to review" })).toBeVisible();
});

test("roster sorts and filters with announced results", async ({ page }) => {
  await page.goto("/educator");
  await page.getByRole("button", { name: "Check first" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Showing" })).toHaveText("Showing 4 of 24 students");
  await page.getByRole("button", { name: "All students" }).click();
  await page.getByRole("button", { name: /^Student/ }).click();
  await expect(page.getByRole("columnheader", { name: /Student/ })).toHaveAttribute("aria-sort", "ascending");
  await expect(page.locator("tbody tr").first()).toContainText("Bennett, Zoe");
});
