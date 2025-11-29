import { test, expect } from "@playwright/test";
import { playAudit } from "playwright-lighthouse";
import type { Page } from "@playwright/test";

test.describe("Lighthouse Audit", () => {
  // increase timeout for lighthouse audits
  test.setTimeout(120000);
  test("Home page should have good metrics", async ({ page }: { page: Page }) => {
    await page.goto("/");

    await playAudit({
      page,
      thresholds: {
        seo: 100,
        performance: 65,
        accessibility: 95,
        "best-practices": 95,
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

  test("Home page (RU) should have good metrics", async ({ page }: { page: Page }) => {
    await page.goto("/ru");

    await playAudit({
      page,
      thresholds: {
        seo: 100,
        performance: 65,
        accessibility: 95,
        "best-practices": 95,
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
