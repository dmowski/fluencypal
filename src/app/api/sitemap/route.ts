import { SupportedLanguage, supportedLanguages } from "@/common/lang";
import { getBlogs } from "@/features/Blog/blogData";
import { getRolePlayScenarios } from "@/features/RolePlay/rolePlayData";

const updateTime = "2025-03-14T18:52:01+00:00";

interface UrlDefinition {
  path: string;
  priority:
    | "1.0000"
    | "0.9000"
    | "0.8000"
    | "0.7000"
    | "0.6000"
    | "0.5000"
    | "0.4000"
    | "0.3000"
    | "0.2000"
    | "0.1000";
}

const baseUrl = "https://www.fluencypal.com";

const generateUrl = (url: UrlDefinition) => {
  const isLangLanding = supportedLanguages.includes(url.path as unknown as SupportedLanguage);

  const path = url.path === "" ? "/" : `/${url.path}`;

  const fullUrl = `${baseUrl}${path}`;
  const defaultLangHref = isLangLanding ? baseUrl + "/" : `${fullUrl}`;

  return `<url>
    <loc>${fullUrl}</loc>
    <lastmod>${updateTime}</lastmod>
    <priority>${url.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${defaultLangHref}"/>

    ${supportedLanguages
      .filter((lang) => lang !== "en")
      .map((lang) => {
        const pathWithLang = isLangLanding ? `${lang}` : `${lang}${url.path === "" ? "" : path}`;
        return `<xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}/${pathWithLang}"/>`;
      })
      .join("\n")}

    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultLangHref}"/>
</url>`;
};

export async function GET(request: Request) {
  const localeLinks: UrlDefinition[] = supportedLanguages
    .filter((lang) => lang !== "en")
    .map((lang) => ({
      path: lang,
      priority: "0.7000",
    }));

  const scenariosData = getRolePlayScenarios("en");
  const scenariosUrls: UrlDefinition[] = scenariosData.map((item) => ({
    path: `scenarios/${item.id}`,
    priority: "0.7000",
  }));

  const blogs = getBlogs("en");
  const blogsUrls: UrlDefinition[] = blogs.map((item) => ({
    path: `blog/${item.id}`,
    priority: "0.6000",
  }));

  const urls: UrlDefinition[] = [
    {
      path: "",
      priority: "1.0000",
    },
    {
      path: "pricing",
      priority: "0.9000",
    },
    {
      path: "scenarios",
      priority: "0.8000",
    },

    {
      path: "blog",
      priority: "0.8000",
    },

    {
      path: "contacts",
      priority: "0.6000",
    },
    {
      path: "terms",
      priority: "0.6000",
    },
    {
      path: "privacy",
      priority: "0.6000",
    },

    {
      path: "practice",
      priority: "0.6000",
    },

    ...localeLinks,
    ...scenariosUrls,
    ...blogsUrls,
  ];

  const textResponse = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
    ${urls.map(generateUrl).join("\n")}
</urlset>
  `;

  return new Response(textResponse, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
