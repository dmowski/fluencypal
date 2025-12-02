import { test, expect } from "@playwright/test";

test.describe("Internationalization", () => {
  test("Russian page should have correct lang attribute and content", async ({ page }) => {
    await page.goto("/ru");

    const htmlLang = await page.locator("html").getAttribute("lang");
    expect(htmlLang).toBe("ru");

    await expect(page.getByText("Часто задаваемые вопросы")).toBeVisible();
  });

  test("French page should have correct lang attribute and content", async ({ page }) => {
    await page.goto("/fr");

    const htmlLang = await page.locator("html").getAttribute("lang");
    expect(htmlLang).toBe("fr");

    await expect(page.getByText("Apprenez n'importe où, n'importe quand")).toBeVisible();
  });

  test("Language switcher should have correct Chinese link on alias-game page", async ({
    page,
  }) => {
    await page.goto("/scenarios/alias-game");

    const chineseLink = page.getByRole("link", { name: "Switch to Chinese" });

    await expect(chineseLink).toHaveAttribute("href", "/zh/scenarios/alias-game");
  });

  test("Page should have description meta tag", async ({ page }) => {
    await page.goto("/");

    const descriptionMeta = page.locator('meta[name="description"]');
    await expect(descriptionMeta).toHaveCount(1);

    const content = await descriptionMeta.getAttribute("content");
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(0);
    expect(content!.startsWith("Practice conversational English with FluencyPal")).toBe(true);
  });

  test("Page should have description meta tag (RU)", async ({ page }) => {
    await page.goto("/ru");

    const descriptionMeta = page.locator('meta[name="description"]');
    await expect(descriptionMeta).toHaveCount(1);

    const content = await descriptionMeta.getAttribute("content");
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(0);
    expect(content!.startsWith("Практикуйте разговорный английский с FluencyPal")).toBe(true);
  });
});
