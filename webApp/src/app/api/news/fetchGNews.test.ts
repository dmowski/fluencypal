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
    await expect(fetchGNewsTopHeadlines({ countryCode: 'us' })).rejects.toBeInstanceOf(
      GNewsConfigurationError,
    );
  });

  it('maps the lib response to the internal RawGNewsArticle shape', async () => {
    process.env.GNEWS_API_KEY = 'test-key';
    const topHeadlines = jest.fn().mockResolvedValue({
      totalArticles: fixture.length,
      articles: fixture,
    });
    __setGNewsClientFactoryForTests(() => ({ topHeadlines }) as any);

    const items = await fetchGNewsTopHeadlines({ countryCode: 'US' });

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

  it('passes default max=3, omits lang/category by default, and normalises country casing', async () => {
    process.env.GNEWS_API_KEY = 'test-key';
    const topHeadlines = jest.fn().mockResolvedValue({
      totalArticles: 1,
      articles: [fixture[0]],
    });
    __setGNewsClientFactoryForTests(() => ({ topHeadlines }) as any);

    await fetchGNewsTopHeadlines({ countryCode: ' US ' });

    expect(topHeadlines).toHaveBeenCalledTimes(1);
    expect(topHeadlines).toHaveBeenCalledWith({
      country: 'us',
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

    await fetchGNewsTopHeadlines({ countryCode: 'de', lang: 'de' });

    expect(topHeadlines).toHaveBeenCalledWith(
      expect.objectContaining({ lang: 'de', country: 'de' }),
    );
  });

  it('forwards an explicit max value', async () => {
    process.env.GNEWS_API_KEY = 'test-key';
    const topHeadlines = jest.fn().mockResolvedValue({
      totalArticles: 1,
      articles: [fixture[0]],
    });
    __setGNewsClientFactoryForTests(() => ({ topHeadlines }) as any);

    await fetchGNewsTopHeadlines({ countryCode: 'gb', max: 10 });

    expect(topHeadlines).toHaveBeenCalledWith(expect.objectContaining({ max: 10, country: 'gb' }));
  });

  it('falls back to a country-less query when results are empty', async () => {
    process.env.GNEWS_API_KEY = 'test-key';
    const topHeadlines = jest
      .fn()
      // attempt 1: country only → empty
      .mockResolvedValueOnce({ totalArticles: 0, articles: [] })
      // attempt 2: no country → has articles
      .mockResolvedValueOnce({ totalArticles: 1, articles: [fixture[0]] });
    __setGNewsClientFactoryForTests(() => ({ topHeadlines }) as any);

    const items = await fetchGNewsTopHeadlines({ countryCode: 'pl' });

    expect(items).toHaveLength(1);
    expect(topHeadlines).toHaveBeenCalledTimes(2);
    expect(topHeadlines).toHaveBeenNthCalledWith(1, { country: 'pl', max: 3 });
    expect(topHeadlines).toHaveBeenNthCalledWith(2, { max: 3 });
  });
});
