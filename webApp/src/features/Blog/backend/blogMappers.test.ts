import { toBlogPost } from './blogMappers';
import { BlogCategoryDocument, BlogDocMeta, BlogVersionDoc } from '../types';

const meta: BlogDocMeta = {
  id: 'post-1',
  publishedVersion: 'v1',
  updatedAtIso: '2026-01-01T00:00:00.000Z',
  createdAtIso: '2026-01-01T00:00:00.000Z',
  publishedAtIso: '2026-01-02T00:00:00.000Z',
};

const version = {
  id: 'v1',
  imagePreviewUrl: 'https://example.com/img.jpg',
  categoryId: 'tech',
  title: { en: 'Hello', fr: 'Bonjour' },
  subTitle: { en: 'Sub', fr: 'Sous-titre' },
  content: { en: 'Body', fr: 'Corps' },
  keywords: { en: ['ai'], fr: ['ia'] },
  createdAtIso: '2026-01-01T00:00:00.000Z',
} as BlogVersionDoc;

const categories = new Map<string, BlogCategoryDocument>([
  [
    'tech',
    {
      id: 'tech',
      title: { en: 'Technology', fr: 'Technologie' } as BlogCategoryDocument['title'],
      updatedAtIso: '2026-01-01T00:00:00.000Z',
    },
  ],
]);

describe('toBlogPost', () => {
  it('returns only the requested language with English fallback', () => {
    const fr = toBlogPost(meta, version, 'fr', categories);
    expect(fr.title).toBe('Bonjour');
    expect(fr.subTitle).toBe('Sous-titre');
    expect(fr.content).toBe('Corps');
    expect(fr.keywords).toEqual(['ia']);
    expect(fr.category.categoryTitle).toBe('Technologie');
  });

  it('falls back to English when the requested language is missing', () => {
    const de = toBlogPost(meta, version, 'de', categories);
    expect(de.title).toBe('Hello');
    expect(de.keywords).toEqual(['ai']);
  });
});
