import fixture from './__fixtures__/gnews.json';
import {
  GNewsConfigurationError,
  __setGNewsClientFactoryForTests,
  fetchGNewsTopHeadlines,
} from './fetchGNews';

describe('fetchGNewsTopHeadlines', () => {
  const originalKey = process.env.GNEWS_API_KEY;

  afterEach(() => {
    process.env.GNEWS_API_KEY = originalKey;
    __setGNewsClientFactoryForTests(null);
  });

  it('throws GNewsConfigurationError when the env var is missing', async () => {
    delete process.env.GNEWS_API_KEY;
    await expect(
      fetchGNewsTopHeadlines({ countryCode: 'us', topic: 'general' }),
    ).rejects.toBeInstanceOf(GNewsConfigurationError);
  });

  it('maps the lib response to the internal RawGNewsArticle shape', async () => {
    process.env.GNEWS_API_KEY = 'test-key';
    const topHeadlines = jest.fn().mockResolvedValue({
      totalArticles: fixture.length,
      articles: fixture,
    });
    __setGNewsClientFactoryForTests(() => ({ topHeadlines }) as any);

    const items = await fetchGNewsTopHeadlines({
      countryCode: 'US',
      topic: 'technology',
    });

    expect(items).toHaveLength(fixture.length);
    expect(items[0]).toEqual({
      title: fixture[0].title,
      description: fixture[0].description,
      content: fixture[0].content,
      url: fixture[0].url,
      image: fixture[0].image,
      publishedAt: fixture[0].publishedAt,
      source: {
        name: fixture[0].source.name,
        url: fixture[0].source.url,
      },
    });
  });

  it('passes default max=3, default lang=en, and normalises country casing', async () => {
    process.env.GNEWS_API_KEY = 'test-key';
    const topHeadlines = jest.fn().mockResolvedValue({ totalArticles: 0, articles: [] });
    __setGNewsClientFactoryForTests(() => ({ topHeadlines }) as any);

    await fetchGNewsTopHeadlines({ countryCode: ' US ', topic: 'health' });

    expect(topHeadlines).toHaveBeenCalledWith({
      country: 'us',
      category: 'health',
      lang: 'en',
      max: 3,
    });
  });

  it('forwards an explicit max value', async () => {
    process.env.GNEWS_API_KEY = 'test-key';
    const topHeadlines = jest.fn().mockResolvedValue({ totalArticles: 0, articles: [] });
    __setGNewsClientFactoryForTests(() => ({ topHeadlines }) as any);

    await fetchGNewsTopHeadlines({ countryCode: 'gb', topic: 'sports', max: 10 });

    expect(topHeadlines).toHaveBeenCalledWith(
      expect.objectContaining({ max: 10, country: 'gb', category: 'sports' }),
    );
  });
});
