import { NEWS_FETCH_CATEGORIES } from '@/features/News/constants';
import { NewsItem } from '@/features/News/types';
import { GetTodayNewsRequest, GetTodayNewsResponse } from '../types';
import { buildNewsId, getNewsDayKey } from '../buildNewsId';
import { getCachedTodayNews, upsertCachedNews } from '../cache';
import { mergeBuiltNewsWithCache } from '../mergeBuiltNewsWithCache';
import { enrichNewsItem } from '../enrichNewsItem';
import { fetchGNewsTopHeadlines, RawGNewsArticle } from '../fetchGNews';
import { toNewsItemSummary } from '../newsRouteHelpers';
import { DESIRED_COUNT, ITEMS_PER_CATEGORY } from './constant';

const CANDIDATES_PER_CATEGORY = 20;

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

  const merged = await Promise.all(built.map((item) => mergeBuiltNewsWithCache(item)));

  await Promise.all(merged.map((item) => upsertCachedNews(item)));

  // Headline translation, tags, and image hosting run in the populate job (not
  // the HTTP handler) so third-party image URLs never reach the client.
  await Promise.all(merged.map((item) => enrichNewsItem(item).catch(() => undefined)));
};

export const getTodayNewsResponse = async (
  request: GetTodayNewsRequest,
): Promise<GetTodayNewsResponse> => {
  const cached = await getCachedTodayNews({
    countryCode: request.countryCode,
    languageCode: request.languageCode,
  });

  if (cached.length < DESIRED_COUNT) {
    await populateTodayNews(request);
    const fresh = await getCachedTodayNews({
      countryCode: request.countryCode,
      languageCode: request.languageCode,
    });
    return { items: fresh.slice(0, DESIRED_COUNT).map(toNewsItemSummary) };
  }

  return { items: cached.slice(0, DESIRED_COUNT).map(toNewsItemSummary) };
};
