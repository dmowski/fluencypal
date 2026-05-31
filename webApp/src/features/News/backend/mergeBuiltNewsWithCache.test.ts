import { NewsItem } from '@/features/News/types';
import { mergeNewsItemWithExisting } from './mergeNewsItemWithExisting';

const built: NewsItem = {
  id: 'news-1',
  title: 'Fresh title',
  subTitle: 'Fresh subtitle',
  titleOrigin: 'Fresh title',
  subTitleOrigin: 'Fresh subtitle',
  content_origin: 'Body',
  imageUrl: '',
  sourceImageUrl: 'https://publisher.example/img.jpg',
  dateIso: '2026-05-31T12:00:00.000Z',
  dayKey: '2026-05-31',
  countryCode: 'us',
  countryName: 'United States',
  languageCode: 'en',
  languageName: 'English',
  sourceUrl: 'https://example.com/a',
  category: 'technology',
  tags: [],
  versions: null,
  createdAtIso: '2026-05-31T13:00:00.000Z',
};

describe('mergeNewsItemWithExisting', () => {
  it('returns built item when nothing is cached', () => {
    expect(mergeNewsItemWithExisting(built, null)).toEqual(built);
  });

  it('preserves cached tags so enrichNewsItem does not regenerate them', () => {
    const existing: NewsItem = {
      ...built,
      tags: ['ai', 'chips'],
      createdAtIso: '2026-05-30T08:00:00.000Z',
    };

    const result = mergeNewsItemWithExisting(built, existing);

    expect(result.tags).toEqual(['ai', 'chips']);
    expect(result.createdAtIso).toBe('2026-05-30T08:00:00.000Z');
  });
});
