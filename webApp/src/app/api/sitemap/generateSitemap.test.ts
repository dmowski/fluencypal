jest.mock('server-only', () => ({}));
jest.mock('@/appRouterI18n', () => ({
  getI18nInstance: (lang: string) => ({ _: (s: string) => s }),
}));

import { bookLandingAbsoluteUrl } from '@/features/Reader/Landing/bookSeo';
import {
  generateAppSitemap,
  generateSitemapForHost,
} from './generateSitemap';
import fs from 'fs';
import path from 'path';

const IS_SAVE_TO_BASELINE = false;

const readBaseline = (filename: string): string => {
  const filePath = path.join(__dirname, 'testData', filename);
  return fs.readFileSync(filePath, 'utf-8');
};

const writeBaseline = (filename: string, data: string): void => {
  const filePath = path.join(__dirname, 'testData', filename);
  fs.writeFileSync(filePath, data, 'utf-8');
};

describe('generateSitemap', () => {
  test('Should correctly generate app sitemap XML with all required elements', async () => {
    const sitemapActual = await generateAppSitemap();

    if (IS_SAVE_TO_BASELINE) {
      writeBaseline('sitemapTest.txt', sitemapActual);
    }

    const baseline = readBaseline('sitemapTest.txt');
    expect(sitemapActual).toContain(baseline);
  });

  test('returns book landing sitemap on book host', async () => {
    const sitemapActual = await generateSitemapForHost('book.fluencypal.com');

    expect(sitemapActual).toContain(`<loc>${bookLandingAbsoluteUrl}</loc>`);
    expect(sitemapActual).not.toContain('https://app.fluencypal.com/practice');
  });

  test('returns app sitemap on app host', async () => {
    const sitemapActual = await generateSitemapForHost('app.fluencypal.com');

    expect(sitemapActual).toContain('https://app.fluencypal.com/practice');
    expect(sitemapActual).not.toContain(bookLandingAbsoluteUrl);
  });
});
