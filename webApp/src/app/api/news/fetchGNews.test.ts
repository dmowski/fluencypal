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

  it('passes default max=3, omits lang by default, and normalises country casing', async () => {
    process.env.GNEWS_API_KEY = 'test-key';
    const topHeadlines = jest.fn().mockResolvedValue({
      totalArticles: 1,
      articles: [fixture[0]],
    });
    __setGNewsClientFactoryForTests(() => ({ topHeadlines }) as any);

    await fetchGNewsTopHeadlines({ countryCode: ' US ', topic: 'health' });

    expect(topHeadlines).toHaveBeenCalledTimes(1);
    expect(topHeadlines).toHaveBeenCalledWith({
      country: 'us',
      category: 'health',
      max: 3,
    });
  });

  it('forwards an explicit lang when provided', async () => {
    process.env.GNEWS_API_KEY = 'test-key';
    const topHeadlines = jest.fn().mockResolvedValue({
      totalArticles: 1,
      articles: [fixture[0]],
    });
    __setGNewsClientFactoryForTests(() => ({ topHeadlines }) as any);

    await fetchGNewsTopHeadlines({ countryCode: 'de', topic: 'general', lang: 'de' });

    expect(topHeadlines).toHaveBeenCalledWith(
      expect.objectContaining({ lang: 'de', country: 'de', category: 'general' }),
    );
  });

  it('forwards an explicit max value', async () => {
    process.env.GNEWS_API_KEY = 'test-key';
    const topHeadlines = jest.fn().mockResolvedValue({
      totalArticles: 1,
      articles: [fixture[0]],
    });
    __setGNewsClientFactoryForTests(() => ({ topHeadlines }) as any);

    await fetchGNewsTopHeadlines({ countryCode: 'gb', topic: 'sports', max: 10 });

    expect(topHeadlines).toHaveBeenCalledWith(
      expect.objectContaining({ max: 10, country: 'gb', category: 'sports' }),
    );
  });

  it('falls back by dropping category, then country, when results are empty', async () => {
    process.env.GNEWS_API_KEY = 'test-key';
    const topHeadlines = jest
      .fn()
      // attempt 1: country + category → empty
      .mockResolvedValueOnce({ totalArticles: 0, articles: [] })
      // attempt 2: country only → empty
      .mockResolvedValueOnce({ totalArticles: 0, articles: [] })
      // attempt 3: category only → has articles
      .mockResolvedValueOnce({ totalArticles: 1, articles: [fixture[0]] });
    __setGNewsClientFactoryForTests(() => ({ topHeadlines }) as any);

    const items = await fetchGNewsTopHeadlines({ countryCode: 'pl', topic: 'sports' });

    expect(items).toHaveLength(1);
    expect(topHeadlines).toHaveBeenCalledTimes(3);
    expect(topHeadlines).toHaveBeenNthCalledWith(1, {
      country: 'pl',
      category: 'sports',
      max: 3,
    });
    expect(topHeadlines).toHaveBeenNthCalledWith(2, { country: 'pl', max: 3 });
    expect(topHeadlines).toHaveBeenNthCalledWith(3, { category: 'sports', max: 3 });
  });
});
