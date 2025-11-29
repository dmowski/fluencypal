import { test, expect } from "@playwright/test";

test.describe("Internationalization", () => {
  test("Russian page should have correct lang attribute and content", async ({ page }) => {
    // Navigate to Russian page
    await page.goto("/ru");

    // Check that the html tag has lang="ru"
    const htmlLang = await page.locator("html").getAttribute("lang");
    expect(htmlLang).toBe("ru");

    // Check that the page contains the expected Russian text
    await expect(page.getByText("Часто задаваемые вопросы")).toBeVisible();
  });

  test("French page should have correct lang attribute and content", async ({ page }) => {
    // Navigate to French page
    await page.goto("/fr");

    // Check that the html tag has lang="fr"
    const htmlLang = await page.locator("html").getAttribute("lang");
    expect(htmlLang).toBe("fr");

    // Check that the page contains the expected French text
    await expect(page.getByText("Apprenez n'importe où, n'importe quand")).toBeVisible();
  });

  test("Language switcher should have correct Chinese link on alias-game page", async ({
    page,
  }) => {
    // Navigate to scenarios/alias-game page
    await page.goto("/scenarios/alias-game");

    // Find the link with aria-label "Switch to Chinese"
    const chineseLink = page.getByRole("link", { name: "Switch to Chinese" });

    // Check that the link has the correct href
    await expect(chineseLink).toHaveAttribute("href", "/zh/scenarios/alias-game");
  });

  test("Page should have description meta tag", async ({ page }) => {
    // Navigate to home page
    await page.goto("/");

    // Check that the page has a description meta tag
    const descriptionMeta = page.locator('meta[name="description"]');
    await expect(descriptionMeta).toHaveCount(1);

    // Verify it has content
    const content = await descriptionMeta.getAttribute("content");
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(0);
    expect(content!.startsWith("Practice conversational English with FluencyPal")).toBe(true);
  });
});
