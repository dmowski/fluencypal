import { test, expect } from "@playwright/test";
import { playAudit } from "playwright-lighthouse";
import type { Page } from "@playwright/test";

test.describe("Lighthouse Audit", () => {
  test("Home page should have good SEO", async ({ page }: { page: Page }) => {
    await page.goto("/");

    await playAudit({
      page,
      thresholds: {
        seo: 100,
      },
      port: 9222,
      reports: {
        formats: {
          html: true,
        },
        name: "lighthouse-report",
        directory: "test-results/lighthouse-reports",
      },
    });
  });
});
