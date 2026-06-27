import {
  bookLandingAbsoluteUrl,
  generateBookSitemapXml,
  getAppHostRobots,
  getBookHostRobots,
  getBookLandingSitemapEntries,
  getBookLandingStructuredData,
} from './bookSeo';
import { bookLandingTitle } from './landingData';

describe('bookSeo', () => {
  test('book landing sitemap contains only the public landing URL', () => {
    const entries = getBookLandingSitemapEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0]?.url).toBe(bookLandingAbsoluteUrl);
  });

  test('book sitemap XML lists only the landing page', () => {
    const xml = generateBookSitemapXml();
    expect(xml).toContain(`<loc>${bookLandingAbsoluteUrl}</loc>`);
    expect(xml).not.toContain('app.fluencypal.com');
  });

  test('book host robots allow landing and block the reader app', () => {
    expect(getBookHostRobots()).toEqual({
      rules: {
        userAgent: '*',
        allow: '/landing',
        disallow: '/',
      },
      sitemap: 'https://book.fluencypal.com/sitemap.xml',
    });
  });

  test('app host robots keep the entire webApp out of search indexes', () => {
    expect(getAppHostRobots()).toEqual({
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    });
  });

  test('structured data graph includes landing page, FAQ, and software application', () => {
    const data = getBookLandingStructuredData();
    expect(data['@graph']).toBeDefined();

    const webPage = data['@graph'].find((node) => node['@type'] === 'WebPage');
    const faqPage = data['@graph'].find((node) => node['@type'] === 'FAQPage');
    const software = data['@graph'].find((node) => node['@type'] === 'SoftwareApplication');

    expect(webPage?.url).toBe(bookLandingAbsoluteUrl);
    expect(webPage?.name).toBe(bookLandingTitle);
    expect(faqPage?.mainEntity).toHaveLength(6);
    expect(software?.featureList).toHaveLength(6);
    expect(software?.isAccessibleForFree).toBe(true);
  });
});
