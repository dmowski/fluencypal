jest.mock("server-only", () => ({}));
jest.mock("@/appRouterI18n", () => ({
  getI18nInstance: (lang: string) => ({ _: (s: string) => s }),
}));

import { generateSitemap } from "./generateSitemap";
import fs from "fs";
import path from "path";

const IS_SAVE_TO_BASELINE = false;

const readBaseline = (filename: string): string => {
  const filePath = path.join(__dirname, "testData", filename);
  return fs.readFileSync(filePath, "utf-8");
};

const writeBaseline = (filename: string, data: string): void => {
  const filePath = path.join(__dirname, "testData", filename);
  fs.writeFileSync(filePath, data, "utf-8");
};

describe("generateSitemap", () => {
  test("Should correctly generate sitemap XML with all required elements", async () => {
    const sitemapActual = await generateSitemap();

    if (IS_SAVE_TO_BASELINE) {
      writeBaseline("sitemapTest.txt", sitemapActual);
    }

    const baseline = readBaseline("sitemapTest.txt");
    // Check that it's valid XML structure
    expect(sitemapActual).toContain(baseline);
  });
});
