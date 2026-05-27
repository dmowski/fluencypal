import { NEWS_FETCH_CATEGORIES } from '@/features/News/constants';
import { NewsItem, NewsItemSummary } from '@/features/News/types';
import { GetTodayNewsRequest, GetTodayNewsResponse } from '../types';
import { buildNewsId, getNewsDayKey } from '../buildNewsId';
import { getCachedTodayNews, upsertCachedNews } from '../cache';
import { enrichNewsItem } from '../enrichNewsItem';
import { needsNewsImageUpload } from '../newsImageUrl';
import { fetchGNewsTopHeadlines, RawGNewsArticle } from '../fetchGNews';
import { DESIRED_COUNT, ITEMS_PER_CATEGORY } from './constant';

const CANDIDATES_PER_CATEGORY = 10;

const toSummary = (item: NewsItem): NewsItemSummary => ({
  id: item.id,
  title: item.title,
  subTitle: item.subTitle,
  imageUrl: item.imageUrl,
  dateIso: item.dateIso,
  countryCode: item.countryCode,
  languageCode: item.languageCode,
  category: item.category,
  tags: item.tags,
});

const buildContentOrigin = (article: RawGNewsArticle): string => {
  const parts: string[] = [];
  if (article.description) parts.push(article.description.trim());
  if (article.content) parts.push(article.content.trim());
  return parts.join('\n\n');
};

const buildNewsItemFromArticle = (
  article: RawGNewsArticle,
  ctx: {
    countryCode: string;
    countryName: string;
    languageCode: string;
    languageName: string;
    dayKey: string;
    category: string;
  },
): NewsItem => {
  const id = buildNewsId({
    countryCode: ctx.countryCode,
    languageCode: ctx.languageCode,
    dateIso: article.publishedAt,
    sourceUrl: article.url,
  });

  const originTitle = article.title ?? '';
  const originSubTitle = article.description ?? '';

  return {
    id,
    title: originTitle,
    subTitle: originSubTitle,
    titleOrigin: originTitle,
    subTitleOrigin: originSubTitle,
    content_origin: buildContentOrigin(article),
    imageUrl: '',
    sourceImageUrl: article.image ?? '',
    dateIso: article.publishedAt,
    dayKey: ctx.dayKey,
    countryCode: ctx.countryCode.trim().toLowerCase(),
    countryName: ctx.countryName,
    languageCode: ctx.languageCode.trim().toLowerCase(),
    languageName: ctx.languageName,
    sourceUrl: article.url,
    category: ctx.category,
    tags: [],
    versions: null,
    createdAtIso: new Date().toISOString(),
  };
};

const inflight = new Map<string, Promise<void>>();

const buildInflightKey = (countryCode: string, languageCode: string): string =>
  `${countryCode.trim().toLowerCase()}|${languageCode.trim().toLowerCase()}|${getNewsDayKey(
    new Date().toISOString(),
  )}`;

const fetchArticlesForCategory = async (
  countryCode: string,
  category: string,
): Promise<RawGNewsArticle[]> => {
  const candidates = await fetchGNewsTopHeadlines({
    countryCode,
    category,
    max: CANDIDATES_PER_CATEGORY,
  });
  return candidates.slice(0, ITEMS_PER_CATEGORY);
};

const populateTodayNews = async (request: GetTodayNewsRequest): Promise<void> => {
  const dayKey = getNewsDayKey(new Date().toISOString());

  const articlesByCategory = (
    await Promise.all(
      NEWS_FETCH_CATEGORIES.map(async (category) => {
        const articles = await fetchArticlesForCategory(request.countryCode, category);
        return articles.map((article) => ({ article, category }));
      }),
    )
  ).flat();

  const built = articlesByCategory.map(({ article, category }) =>
    buildNewsItemFromArticle(article, {
      countryCode: request.countryCode,
      countryName: request.countryName,
      languageCode: request.languageCode,
      languageName: request.languageName,
      dayKey,
      category,
    }),
  );

  await Promise.all(built.map((item) => upsertCachedNews(item)));

  // Headline translation, tags, and image hosting run in the populate job (not
  // the HTTP handler) so third-party image URLs never reach the client.
  await Promise.all(built.map((item) => enrichNewsItem(item).catch(() => undefined)));
};

const scheduleStaleItemEnrichment = (items: NewsItem[]): void => {
  for (const item of items) {
    if (!needsNewsImageUpload(item)) continue;
    void enrichNewsItem(item).catch(() => undefined);
  }
};

const ensurePopulateScheduled = (request: GetTodayNewsRequest): void => {
  const key = buildInflightKey(request.countryCode, request.languageCode);
  if (inflight.has(key)) return;

  const work = populateTodayNews(request).finally(() => {
    inflight.delete(key);
  });
  inflight.set(key, work);
};

export const getTodayNewsResponse = async (
  request: GetTodayNewsRequest,
): Promise<GetTodayNewsResponse> => {
  const cached = await getCachedTodayNews({
    countryCode: request.countryCode,
    languageCode: request.languageCode,
  });

  scheduleStaleItemEnrichment(cached);

  if (cached.length < DESIRED_COUNT) {
    ensurePopulateScheduled(request);
  }

  return { items: cached.slice(0, DESIRED_COUNT).map(toSummary) };
};
