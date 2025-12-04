import { test, expect } from "@playwright/test";
import { playAudit } from "playwright-lighthouse";
import type { Page } from "@playwright/test";

test.describe("Lighthouse Audit", () => {
  // increase timeout for lighthouse audits
  test.setTimeout(120000);
  test("Home page should have good metrics (EN)", async ({ page }: { page: Page }) => {
    await page.goto("/");

    await playAudit({
      page,
      thresholds: {
        seo: 100,
        performance: 84,
        accessibility: 100,
        "best-practices": 100,
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

  test("Home page should have good metrics (RU)", async ({ page }: { page: Page }) => {
    await page.goto("/ru");

    await playAudit({
      page,
      thresholds: {
        seo: 100,
        performance: 95,
        accessibility: 100,
        "best-practices": 100,
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

  test("Interview Landing page should have good metrics (EN)", async ({ page }: { page: Page }) => {
    await page.goto("/interview/senior-frontend-developer");

    await playAudit({
      page,
      thresholds: {
        seo: 100,
        performance: 95,
        accessibility: 100,
        "best-practices": 100,
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
