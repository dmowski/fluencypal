import { test } from "@playwright/test";
import { playAudit } from "playwright-lighthouse";
import type { Page } from "@playwright/test";

const SETTINGS = {
  port: 9222,
  reports: {
    formats: {
      html: true,
    },
    name: "lighthouse-report",
    directory: "test-results/lighthouse-reports",
  },
};

test.describe("Lighthouse Audit", () => {
  // increase timeout for lighthouse audits
  test.setTimeout(120000);
  test("Home page (EN)", async ({ page }: { page: Page }) => {
    await page.goto("/");

    await playAudit({
      page,
      thresholds: {
        seo: 100,
        performance: 84,
        accessibility: 100,
        "best-practices": 100,
      },
      ...SETTINGS,
    });
  });

  test("Home page (RU)", async ({ page }: { page: Page }) => {
    await page.goto("/ru");

    await playAudit({
      page,
      thresholds: {
        seo: 100,
        performance: 95,
        accessibility: 100,
        "best-practices": 100,
      },
      ...SETTINGS,
    });
  });

  test("Interview Landing page (EN)", async ({ page }: { page: Page }) => {
    await page.goto("/interview/senior-frontend-developer");

    await playAudit({
      page,
      thresholds: {
        seo: 50,
        performance: 90,
        accessibility: 100,
        "best-practices": 77,
      },
      ...SETTINGS,
    });
  });
});
