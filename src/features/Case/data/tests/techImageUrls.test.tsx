// Mock i18n to avoid top-level await issues in test environment
jest.mock("@/appRouterI18n", () => ({
  getI18nInstance: () => ({
    _: (s: string) => s,
  }),
}));

import { getAllInterviews } from "../data";
import fs from "fs";
import path from "path";
import { SupportedLanguage } from "@/features/Lang/lang";
import type { InterviewData, TechStackSection, TechItem } from "@/features/Case/types";

// Helper to check basic URL validity
const isValidUrl = (url: string): boolean => {
  try {
    const u = new URL(url);
    return !!u.protocol && !!u.host;
  } catch {
    return false;
  }
};

// Prefer HEAD to avoid downloading full images; fallback to GET if HEAD not allowed
const requestUrl = async (url: string): Promise<Response> => {
  try {
    const res = await fetch(url, { method: "HEAD" });
    if (res.ok) return res;
    // Some CDNs may not support HEAD properly; try GET
    return await fetch(url, { method: "GET" });
  } catch (e) {
    throw e;
  }
};

describe("Tech stack image URLs", () => {
  const languages: SupportedLanguage[] = ["en"];

  languages.forEach((lang) => {
    test(`all tech image URLs are valid and reachable [${lang}]`, async () => {
      const { interviews } = getAllInterviews(lang);

      const failures: string[] = [];

      const requests: Array<Promise<void>> = [];

      interviews.forEach((interview: InterviewData) => {
        interview.sections.forEach((section) => {
          if (section.type === "techStack") {
            const techSection = section as TechStackSection;
            const groups = techSection.techGroups || [];
            groups.forEach((group) => {
              (group.items || []).forEach((item: TechItem) => {
                const url: string = item.logoUrl;
                if (!url) {
                  failures.push(
                    `${interview.coreData.id} :: Missing logoUrl for item: ${item.label}`
                  );
                  return;
                }
                // If local asset, ensure it exists in public folder
                if (url.startsWith("/")) {
                  const publicPath = path.join(process.cwd(), "public", url);
                  if (!fs.existsSync(publicPath)) {
                    failures.push(`${interview.coreData.id} :: Missing public file: ${publicPath}`);
                  }
                  return; // skip network request for local files
                }

                // Basic format check for external URLs
                if (!isValidUrl(url)) {
                  failures.push(`${interview.coreData.id} :: Invalid URL format: ${url}`);
                  return;
                }

                // Schedule real request
                const p = requestUrl(url)
                  .then((res) => {
                    if (!res.ok) {
                      failures.push(
                        `${interview.coreData.id} :: Unreachable URL (${res.status}): ${url}`
                      );
                    }
                  })
                  .catch((err) => {
                    failures.push(
                      `${interview.coreData.id} :: Request failed: ${url} :: ${String(err)}`
                    );
                  });
                requests.push(p);
              });
            });
          }
        });
      });

      // Await all network requests (limit parallelism if needed)
      await Promise.all(requests);

      if (failures.length) {
        const message = failures.join("\n");
        throw new Error(`Invalid tech image URLs found:\n${message}`);
      }
    }, 30000);
  });
});
