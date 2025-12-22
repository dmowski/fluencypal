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
  test.setTimeout(120000);

  const isDevMode = async (page: Page) => {
    const devModeButton = await page.$("#devtools-indicator");
    return devModeButton !== null;
  };

  test("Home page (EN)", async ({ page }: { page: Page }) => {
    await page.goto("/");
    if (await isDevMode(page)) return;

    await playAudit({
      page,
      thresholds: {
        seo: 100,
        performance: 79,
        accessibility: 100,
        "best-practices": 100,
      },
      ...SETTINGS,
    });
  });

  test("Home page (RU)", async ({ page }: { page: Page }) => {
    await page.goto("/ru");
    if (await isDevMode(page)) return;

    await playAudit({
      page,
      thresholds: {
        seo: 100,
        performance: 79,
        accessibility: 100,
        "best-practices": 100,
      },
      ...SETTINGS,
    });
  });

  test("Interview Landing page (EN)", async ({ page }: { page: Page }) => {
    await page.goto("/case/senior-frontend-developer");
    if (await isDevMode(page)) return;

    await playAudit({
      page,
      thresholds: {
        seo: 100,
        performance: 79,
        accessibility: 100,
        "best-practices": 77,
      },
      ...SETTINGS,
    });
  });
});
