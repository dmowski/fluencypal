import {
  bookLandingAbsoluteUrl,
  getAppHostRobots,
  getBookHostRobots,
  getBookLandingSitemapEntries,
  getBookLandingStructuredData,
} from './bookSeo';

describe('bookSeo', () => {
  test('book landing sitemap contains only the public landing URL', () => {
    const entries = getBookLandingSitemapEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0]?.url).toBe(bookLandingAbsoluteUrl);
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

  test('structured data points at the landing page URL', () => {
    const data = getBookLandingStructuredData();
    expect(data.url).toBe(bookLandingAbsoluteUrl);
    expect(data['@type']).toBe('WebPage');
  });
});
