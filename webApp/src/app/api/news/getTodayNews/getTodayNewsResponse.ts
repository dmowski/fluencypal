import { NewsItem, NewsItemSummary } from '@/features/News/types';
import { GetTodayNewsRequest, GetTodayNewsResponse } from '../types';
import { buildNewsId, getNewsDayKey } from '../buildNewsId';
import { getCachedTodayNews, upsertCachedNews } from '../cache';
import { copyNewsImageToStorage } from '../copyImageToStorage';
import { fetchGNewsTopHeadlines, RawGNewsArticle } from '../fetchGNews';
import { rewriteNewsForLevels } from '../rewriteNewsForLevels';
import { translateNewsHeadline } from '../translateNewsHeadline';

const DESIRED_COUNT = 6;

const toSummary = (item: NewsItem): NewsItemSummary => ({
  id: item.id,
  title: item.title,
  subTitle: item.subTitle,
  imageUrl: item.imageUrl,
  dateIso: item.dateIso,
  countryCode: item.countryCode,
  languageCode: item.languageCode,
});

const buildContentOrigin = (article: RawGNewsArticle): string => {
  const parts: string[] = [];
  if (article.description) parts.push(article.description.trim());
  if (article.content) parts.push(article.content.trim());
  return parts.join('\n\n');
};

const buildNewsItemFromArticle = async (
  article: RawGNewsArticle,
  ctx: {
    countryCode: string;
    countryName: string;
    languageCode: string;
    languageName: string;
    dayKey: string;
  },
): Promise<NewsItem> => {
  const id = buildNewsId({
    countryCode: ctx.countryCode,
    languageCode: ctx.languageCode,
    dateIso: article.publishedAt,
    sourceUrl: article.url,
  });

  const content_origin = buildContentOrigin(article);
  const originTitle = article.title ?? '';
  const originSubTitle = article.description ?? '';

  // Image copy, headline translation, and AI rewrites can run in parallel per article.
  const [imageUrl, translated, versions] = await Promise.all([
    article.image
      ? copyNewsImageToStorage({ sourceUrl: article.image, newsId: id }).catch(() => '')
      : Promise.resolve(''),
    translateNewsHeadline({
      title: originTitle,
      subTitle: originSubTitle,
      targetLanguageName: ctx.languageName,
    }).catch(() => ({ title: originTitle, subTitle: originSubTitle })),
    rewriteNewsForLevels({
      title: originTitle,
      content_origin,
      targetLanguageName: ctx.languageName,
    }).catch(() => null),
  ]);

  return {
    id,
    title: translated.title,
    subTitle: translated.subTitle,
    titleOrigin: originTitle,
    subTitleOrigin: originSubTitle,
    content_origin,
    imageUrl,
    sourceImageUrl: article.image ?? '',
    dateIso: article.publishedAt,
    dayKey: ctx.dayKey,
    countryCode: ctx.countryCode.trim().toLowerCase(),
    countryName: ctx.countryName,
    languageCode: ctx.languageCode.trim().toLowerCase(),
    languageName: ctx.languageName,
    sourceUrl: article.url,
    versions,
    createdAtIso: new Date().toISOString(),
  };
};

// Single-process in-memory de-dupe of concurrent populate-cache work, keyed
// by `countryCode|languageCode|dayKey(UTC)`. Multiple concurrent requests for
// the same window share one underlying populate Promise.
const inflight = new Map<string, Promise<NewsItem[]>>();

const buildInflightKey = (countryCode: string, languageCode: string): string =>
  `${countryCode.trim().toLowerCase()}|${languageCode.trim().toLowerCase()}|${getNewsDayKey(
    new Date().toISOString(),
  )}`;

const populateTodayNews = async (request: GetTodayNewsRequest): Promise<NewsItem[]> => {
  const articles = await fetchGNewsTopHeadlines({
    countryCode: request.countryCode,
    max: DESIRED_COUNT,
  });

  const dayKey = getNewsDayKey(new Date().toISOString());

  const built = await Promise.all(
    articles.map((article) =>
      buildNewsItemFromArticle(article, {
        countryCode: request.countryCode,
        countryName: request.countryName,
        languageCode: request.languageCode,
        languageName: request.languageName,
        dayKey,
      }),
    ),
  );

  await Promise.all(built.map((item) => upsertCachedNews(item)));
  return built;
};

export const getTodayNewsResponse = async (
  request: GetTodayNewsRequest,
): Promise<GetTodayNewsResponse> => {
  const cached = await getCachedTodayNews({
    countryCode: request.countryCode,
    languageCode: request.languageCode,
  });
  if (cached.length >= DESIRED_COUNT) {
    return { items: cached.slice(0, DESIRED_COUNT).map(toSummary) };
  }

  const key = buildInflightKey(request.countryCode, request.languageCode);
  let work = inflight.get(key);
  if (!work) {
    work = populateTodayNews(request).finally(() => {
      inflight.delete(key);
    });
    inflight.set(key, work);
  }

  const items = await work;
  return { items: items.slice(0, DESIRED_COUNT).map(toSummary) };
};
