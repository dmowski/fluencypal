jest.mock('./cache', () => ({
  upsertCachedNews: jest.fn(),
}));

jest.mock('./copyImageToStorage', () => ({
  copyNewsImageToStorage: jest.fn(),
}));

jest.mock('./generateNewsTags', () => ({
  generateNewsTags: jest.fn(),
}));

jest.mock('./translateNewsHeadline', () => ({
  translateNewsHeadline: jest.fn(),
}));

jest.mock('./rewriteNewsForLevels', () => ({
  rewriteNewsForLevels: jest.fn(),
}));

import { NewsItem } from '@/features/News/types';
import { upsertCachedNews } from './cache';
import { enrichNewsItem } from './enrichNewsItem';
import { rewriteNewsForLevels } from './rewriteNewsForLevels';
import { translateNewsHeadline } from './translateNewsHeadline';

const mockedUpsert = upsertCachedNews as jest.MockedFunction<typeof upsertCachedNews>;
const mockedTranslate = translateNewsHeadline as jest.MockedFunction<typeof translateNewsHeadline>;
const mockedRewrite = rewriteNewsForLevels as jest.MockedFunction<typeof rewriteNewsForLevels>;

const baseItem: NewsItem = {
  id: 'news-1',
  title: 'Origin title',
  subTitle: 'Origin subtitle',
  titleOrigin: 'Origin title',
  subTitleOrigin: 'Origin subtitle',
  content_origin: 'Article body from gNews.',
  imageUrl: 'https://storage.googleapis.com/bucket/news-1.jpg',
  sourceImageUrl: 'https://publisher.example/img.jpg',
  dateIso: '2026-05-31T12:00:00.000Z',
  dayKey: '2026-05-31',
  countryCode: 'us',
  countryName: 'United States',
  languageCode: 'en',
  languageName: 'English',
  sourceUrl: 'https://example.com/article',
  category: 'technology',
  tags: ['ai'],
  versions: null,
  createdAtIso: '2026-05-31T12:00:00.000Z',
};

describe('enrichNewsItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedTranslate.mockResolvedValue({
      title: 'Translated title',
      subTitle: 'Translated subtitle',
    });
  });

  it('does not generate body versions (lazy via getNewsFullText)', async () => {
    const item: NewsItem = {
      ...baseItem,
      title: 'Origin title',
      subTitle: 'Origin subtitle',
      versions: null,
    };

    await enrichNewsItem(item);

    expect(mockedRewrite).not.toHaveBeenCalled();
    expect(mockedUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: item.id,
        versions: null,
      }),
    );
  });

  it('skips work when headline, tags, and image are already enriched', async () => {
    const item: NewsItem = {
      ...baseItem,
      title: 'Already translated',
      subTitle: 'Already translated sub',
      tags: ['existing'],
      imageUrl: 'https://storage.googleapis.com/bucket/already.jpg',
    };

    await enrichNewsItem(item);

    expect(mockedTranslate).not.toHaveBeenCalled();
    expect(mockedRewrite).not.toHaveBeenCalled();
    expect(mockedUpsert).not.toHaveBeenCalled();
  });
});
