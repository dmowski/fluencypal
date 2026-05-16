import GNews from '@gnews-io/gnews-io-js';

/**
 * Minimal article shape we depend on internally. Keeps the rest of the
 * pipeline decoupled from the third-party `@gnews-io/gnews-io-js` types.
 */
export interface RawGNewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

export interface FetchGNewsTopHeadlinesParams {
  countryCode: string;
  /** Maximum number of articles to request. Defaults to 3. */
  max?: number;
  /**
   * Article language (e.g. 'en'). When omitted, the gNews `lang` filter is
   * NOT applied — articles are returned in any language the country publishes
   * in. This is the right default for our pipeline because the rewrite step
   * translates the source into the user's target language at three CEFR
   * levels, and forcing a `lang` filter collapses inventory to ~0 for many
   * countries.
   */
  lang?: string;
}

export class GNewsConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GNewsConfigurationError';
  }
}

const DEFAULT_MAX = 3;

/**
 * Lazily instantiate a `GNews` client so missing env vars only surface when
 * the wrapper is actually invoked (not at module import time).
 *
 * Exposed primarily so unit tests can inject a fake client; in production
 * code, prefer calling `fetchGNewsTopHeadlines` directly.
 */
let clientFactory: (apiKey: string) => Pick<GNews, 'topHeadlines'> = (apiKey) => new GNews(apiKey);

export const __setGNewsClientFactoryForTests = (
  factory: ((apiKey: string) => Pick<GNews, 'topHeadlines'>) | null,
) => {
  clientFactory = factory ?? ((apiKey) => new GNews(apiKey));
};

const mapArticle = (article: RawGNewsArticle): RawGNewsArticle => ({
  title: article.title ?? '',
  description: article.description ?? '',
  content: article.content ?? '',
  url: article.url ?? '',
  image: article.image ?? '',
  publishedAt: article.publishedAt ?? '',
  source: {
    name: article.source?.name ?? '',
    url: article.source?.url ?? '',
  },
});

/**
 * Fetch top headlines from gNews and normalise them into `RawGNewsArticle[]`.
 *
 * Strategy: gNews `top-headlines` with `country` returns the country's general
 * top headlines. If that comes back empty (small countries, off-hours, etc.)
 * we fall back to a global query so the UI always has something to show.
 *
 * Throws `GNewsConfigurationError` when `GNEWS_API_KEY` is not configured.
 */
export const fetchGNewsTopHeadlines = async ({
  countryCode,
  max = DEFAULT_MAX,
  lang,
}: FetchGNewsTopHeadlinesParams): Promise<RawGNewsArticle[]> => {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    throw new GNewsConfigurationError('GNEWS_API_KEY env var is not set');
  }

  const client = clientFactory(apiKey);
  const normalisedCountry = countryCode.trim().toLowerCase();

  const tryFetch = async (
    params: Parameters<GNews['topHeadlines']>[0],
  ): Promise<RawGNewsArticle[]> => {
    const response = await client.topHeadlines(params);
    return (response.articles ?? []).map(mapArticle);
  };

  const attempts: Array<Parameters<GNews['topHeadlines']>[0]> = [
    { country: normalisedCountry, max, ...(lang ? { lang } : {}) },
    { max, ...(lang ? { lang } : {}) },
  ];

  for (const params of attempts) {
    const articles = await tryFetch(params);
    if (articles.length > 0) return articles;
  }

  return [];
};
