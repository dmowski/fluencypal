// Top-level lightweight mocks so we can import statically below.
jest.mock("server-only", () => ({}));
jest.mock("@/appRouterI18n", () => ({
  getI18nInstance: (lang: string) => ({ _: (s: string) => s }),
}));

import { siteUrl } from "@/common/metadata";
import { APP_NAME } from "@/features/Landing/landingSettings";
import { generateMetadataInfo } from "../metadata";

describe("generateMetadataInfo", () => {
  test("generates metadata for homepage", () => {
    const meta = generateMetadataInfo({ lang: "en", currentPath: "" });
    expect(meta.title).toContain(APP_NAME);
    expect(meta.description).toBeDefined();
    expect(meta.openGraph.images[0].url).toBe(`${siteUrl}openGraph.png`);
  });

  test("generates metadata for blog with blogId", () => {
    const meta = generateMetadataInfo({
      lang: "en",
      currentPath: "blog",
      blogId: "no-projections-available",
    });
    expect(meta.title).toBe(
      "No Projections Available - Practice English Conversation with AI | FluencyPal"
    );
    expect(meta.description).toBe("A silence at the end of the algorithm");
    expect(meta.openGraph.images[0].url).toBe("/blog/dog/dog-park.webp");
  });

  test("generates metadata for scenarios with scenarioId", () => {
    const meta = generateMetadataInfo({
      lang: "en",
      currentPath: "scenarios",
      scenarioId: "alias-game",
    });
    expect(meta.title).toBe(
      "Alias Word Guessing Game - Practice English Conversation with AI | FluencyPal"
    );
    expect(meta.description).toBe(
      "Practice vocabulary by creatively describing and guessing words"
    );
    expect(meta.openGraph.images[0].url).toBe(
      `https://www.fluencypal.com//role/f0de782c-6f1a-4005-924d-02459308a4fa.webp`
    );
  });

  test("generates metadata for ru language homepage", () => {
    const meta = generateMetadataInfo({ lang: "ru", currentPath: "" });

    expect(meta.title).toBe(`FluencyPal – AI English Speaking Practice for Fluency & Confidence`);
    expect(meta.alternates.canonical).toBe(`https://www.fluencypal.com/ru`);
  });

  test("generates metadata for scenarios with scenarioId for ru", () => {
    const meta = generateMetadataInfo({
      lang: "ru",
      currentPath: "scenarios",
      scenarioId: "alias-game",
    });
    expect(meta.title).toBe(
      "Alias Word Guessing Game - Practice English Conversation with AI | FluencyPal"
    );
    expect(meta.description).toBe(
      "Practice vocabulary by creatively describing and guessing words"
    );
    expect(meta.alternates.canonical).toBe(`https://www.fluencypal.com/ru/scenarios/alias-game`);
  });
});
