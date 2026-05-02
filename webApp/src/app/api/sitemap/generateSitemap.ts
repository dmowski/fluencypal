import { SupportedLanguage, supportedLanguages } from '@/features/Lang/lang';
import { getRolePlayScenarios } from '@/features/RolePlay/rolePlayData';
import { getAllInterviews } from '@/features/Case/data/data';

const updateTime = '2026-05-02T13:01:02+00:00';

interface UrlDefinition {
  path: string;
  priority:
    | '1.0000'
    | '0.9000'
    | '0.8000'
    | '0.7000'
    | '0.6000'
    | '0.5000'
    | '0.4000'
    | '0.3000'
    | '0.2000'
    | '0.1000';
}

const baseUrl = 'https://app.fluencypal.com';

const generateUrl = (url: UrlDefinition) => {
  const isLangLanding = supportedLanguages.includes(url.path as unknown as SupportedLanguage);

  const path = url.path === '' ? '/' : `/${url.path}`;

  const fullUrl = `${baseUrl}${path}`;
  const defaultLangHref = isLangLanding ? baseUrl + '/' : `${fullUrl}`;

  return `<url>
    <loc>${fullUrl}</loc>
    <lastmod>${updateTime}</lastmod>
    <priority>${url.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${defaultLangHref}"/>
${supportedLanguages
  .filter((lang) => lang !== 'en')
  .map((lang) => {
    const pathWithLang = isLangLanding ? `${lang}` : `${lang}${url.path === '' ? '' : path}`;
    return `        <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}/${pathWithLang}"/>`;
  })
  .join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultLangHref}"/>
</url>`;
};

export async function generateSitemap(): Promise<string> {
  const localeLinks: UrlDefinition[] = supportedLanguages
    .filter((lang) => lang !== 'en')
    .map((lang) => ({
      path: lang,
      priority: '0.7000',
    }));

  const casesData = getAllInterviews('en');
  const cases = casesData.interviews;
  const casesCategories = casesData.categoriesList;
  const casesUrls: UrlDefinition[] = cases.map((item) => ({
    path: `case/${item.coreData.id}`,
    priority: '0.7000',
  }));

  const casesCategoriesUrls: UrlDefinition[] = casesCategories
    .filter((item) => item.categoryId !== casesData.allCategory.categoryId)
    .map((item) => ({
      path: `case?category=${item.categoryId}`,
      priority: '0.5000',
    }));

  const quizUrls: UrlDefinition[] = supportedLanguages
    .filter((lang) => lang !== 'en')
    .map((lang) => ({
      path: `quiz?learn=${lang}`,
      priority: '0.8000',
    }));

  const urls: UrlDefinition[] = [
    {
      path: '',
      priority: '1.0000',
    },

    {
      path: 'quiz',
      priority: '0.9000',
    },

    {
      path: 'case',
      priority: '0.8000',
    },

    {
      path: 'practice',
      priority: '0.6000',
    },

    ...localeLinks,
    ...casesUrls,
    ...casesCategoriesUrls,
    ...quizUrls,
  ];

  const textResponse = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(generateUrl).join('\n')}
</urlset>
  `;

  return textResponse;
}
