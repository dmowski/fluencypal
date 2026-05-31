jest.mock('server-only', () => ({}));
jest.mock('@/appRouterI18n', () => ({
  getI18nInstance: (lang: string) => ({ _: (s: string) => s }),
}));

import { generateSitemap } from './generateSitemap';
import { fetchBlogsFromApp } from '@/features/Blog/blogApi';
import fs from 'fs';
import path from 'path';

jest.mock('@/features/Blog/blogApi');

const IS_SAVE_TO_BASELINE = false;

const readBaseline = (filename: string): string => {
  const filePath = path.join(__dirname, 'testData', filename);
  return fs.readFileSync(filePath, 'utf-8');
};

const writeBaseline = (filename: string, data: string): void => {
  const filePath = path.join(__dirname, 'testData', filename);
  fs.writeFileSync(filePath, data, 'utf-8');
};

const mockFetchBlogsFromApp = fetchBlogsFromApp as jest.MockedFunction<typeof fetchBlogsFromApp>;

describe('generateSitemap', () => {
  beforeEach(() => {
    mockFetchBlogsFromApp.mockRejectedValue(new Error('API unavailable in tests'));
  });

  test('Should correctly generate sitemap XML with all required elements', async () => {
    const sitemapActual = await generateSitemap();

    if (IS_SAVE_TO_BASELINE) {
      writeBaseline('sitemapTest.txt', sitemapActual);
    }

    const baseline = readBaseline('sitemapTest.txt');
    // Check that it's valid XML structure
    expect(sitemapActual).toContain(baseline);
  });

  test('includes published API blog posts and their categories', async () => {
    mockFetchBlogsFromApp.mockResolvedValue({
      blogs: [
        {
          id: 'test_blog',
          title: 'Test blog post',
          subTitle: 'Test subtitle',
          keywords: ['test'],
          content: 'Content',
          imagePreviewUrl: 'https://example.com/image.png',
          publishedAtIso: '2026-05-31T13:18:47.230Z',
          category: {
            categoryId: 'test_category',
            categoryTitle: 'Test category',
          },
          relatedRolePlays: [],
        },
      ],
      categories: [{ categoryId: 'test_category', categoryTitle: 'Test category' }],
    });

    const sitemapActual = await generateSitemap();

    expect(sitemapActual).toContain('https://www.fluencypal.com/blog/test_blog');
    expect(sitemapActual).toContain('https://www.fluencypal.com/blog?category=test_category');
  });
});
