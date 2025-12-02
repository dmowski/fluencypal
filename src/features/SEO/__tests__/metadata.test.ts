jest.mock("server-only", () => ({}));

jest.mock("../../../appRouterI18n", () => ({
  getI18nInstance: (lang: string) => ({ _: (s: string) => s }),
}));

jest.mock("../../../initLingui", () => ({
  initLingui: jest.fn(),
}));

jest.mock("../../RolePlay/rolePlayData", () => ({
  getRolePlayScenarios: () => ({
    categoriesList: [],
    rolePlayScenarios: [],
  }),
}));

jest.mock("../../Blog/blogData", () => ({
  getBlogs: () => ({ categoriesList: [], blogs: [] }),
}));

jest.mock("../../Lang/getLabels", () => ({
  getLangLearnPlanLabels: () => ({ en: "English Plan" }),
}));

import { siteUrl } from "../../../common/metadata";
import {
  getOpenGraph,
  getTwitterCard,
  getMetadataIcons,
  generateAlternatesTags,
  getMetadataUrls,
} from "../metadata";

describe("metadata helpers", () => {
  test("getOpenGraph builds correct object", () => {
    const result = getOpenGraph({
      title: "T",
      description: "D",
      ogUrl: "https://example.com/page",
      openGraphImageUrl: "https://example.com/img.png",
      alt: "Alt text",
    });

    expect(result.title).toBe("T");
    expect(result.description).toBe("D");
    expect(result.url).toBe("https://example.com/page");
    expect(Array.isArray(result.images)).toBe(true);
    expect(result.images[0].url).toBe("https://example.com/img.png");
    expect(result.images[0].width).toBe(1200);
    expect(result.images[0].height).toBe(630);
    expect(result.images[0].alt).toBe("Alt text");
    expect(result.type).toBe("website");
  });

  test("getTwitterCard returns provided image and fields", () => {
    const result = getTwitterCard({
      title: "TT",
      description: "DD",
      openGraphImageUrl: "https://example.com/twitter.png",
    });

    expect(result.card).toBe("summary_large_image");
    expect(result.title).toBe("TT");
    expect(result.description).toBe("DD");
    expect(result.images).toEqual(["https://example.com/twitter.png"]);
    expect(result.creator).toBe("@dmowskii");
  });

  test("getMetadataIcons returns icon and apple entries", () => {
    const icons = getMetadataIcons();
    expect(icons.icon).toBeDefined();
    expect(icons.icon.some((i: any) => i.url === "/favicon-48x48.png")).toBe(true);
    expect(icons.apple).toBeDefined();
    expect(icons.apple[0].url).toBe("/logo192.png");
  });

  test("generateAlternatesTags constructs language links", () => {
    const path = "blog?category=tech";
    const tags = generateAlternatesTags({ path, lang: "fr" });

    // canonical should equal the French URL for the path
    expect(tags.canonical).toBe(`${siteUrl}fr/${path}`);
    // languages map should contain x-default pointing to English
    expect(tags.languages["x-default"]).toBe(`${siteUrl}blog?category=tech`);
    // a sample language entry
    expect(tags.languages["en"]).toBe(`${siteUrl}blog?category=tech`);
    expect(tags.languages["fr"]).toBe(`${siteUrl}fr/${path}`);
  });

  test("getMetadataUrls returns ogUrl matching alternates.languages for given lang", () => {
    const res = getMetadataUrls({
      pagePath: "blog",
      id: "123",
      queries: { category: "tech" },
      supportedLang: "fr",
    });

    expect(res.pathWithQueries).toBe("blog/123?category=tech");
    expect(res.ogUrl).toBe(res.alternates.languages["fr"]);
    expect(res.alternates.canonical).toBe("https://www.fluencypal.com/fr/blog/123?category=tech");
    expect(res.alternates.languages.fr).toBe(
      "https://www.fluencypal.com/fr/blog/123?category=tech"
    );
    expect(res.alternates.languages.en).toBe("https://www.fluencypal.com/blog/123?category=tech");
  });
});
