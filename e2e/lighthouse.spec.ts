import { test, expect } from "@playwright/test";
import { playAudit } from "playwright-lighthouse";
import type { Page } from "@playwright/test";

test.describe("Lighthouse Audit", () => {
  test("Home page should have good SEO", async ({ page }: { page: Page }) => {
    await page.goto("/");

    await playAudit({
      page,
      thresholds: {
        seo: 95,
      },
      port: 9222,
    });
  });
});
