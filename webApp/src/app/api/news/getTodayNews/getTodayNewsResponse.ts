import { NewsItem, NewsItemSummary, NewsTopic } from '@/features/News/types';
import { GetTodayNewsRequest, GetTodayNewsResponse } from '../types';
import { buildNewsId, getNewsDayKey } from '../buildNewsId';
import { getCachedTodayNews, upsertCachedNews } from '../cache';
import { copyNewsImageToStorage } from '../copyImageToStorage';
import { fetchGNewsTopHeadlines, RawGNewsArticle } from '../fetchGNews';
import { rewriteNewsForLevels } from '../rewriteNewsForLevels';

const DESIRED_COUNT = 3;

const toSummary = (item: NewsItem): NewsItemSummary => ({
  id: item.id,
  title: item.title,
  subTitle: item.subTitle,
  imageUrl: item.imageUrl,
  dateIso: item.dateIso,
  countryCode: item.countryCode,
  topic: item.topic,
});

const buildContentOrigin = (article: RawGNewsArticle): string => {
  const parts: string[] = [];
  if (article.description) parts.push(article.description.trim());
  if (article.content) parts.push(article.content.trim());
  return parts.join('\n\n');
};

const buildNewsItemFromArticle = async (
  article: RawGNewsArticle,
  ctx: { countryCode: string; countryName: string; topic: NewsTopic },
): Promise<NewsItem> => {
  const id = buildNewsId({
    countryCode: ctx.countryCode,
    dateIso: article.publishedAt,
    sourceUrl: article.url,
  });

  const content_origin = buildContentOrigin(article);

  // Image copy and AI rewrites can run in parallel per article.
  const [imageUrl, versions] = await Promise.all([
    article.image
      ? copyNewsImageToStorage({ sourceUrl: article.image, newsId: id }).catch(() => '')
      : Promise.resolve(''),
    rewriteNewsForLevels({ title: article.title, content_origin }).catch(() => null),
  ]);

  return {
    id,
    title: article.title,
    subTitle: article.description ?? '',
    content_origin,
    imageUrl,
    sourceImageUrl: article.image ?? '',
    dateIso: article.publishedAt,
    countryCode: ctx.countryCode.trim().toLowerCase(),
    countryName: ctx.countryName,
    topic: ctx.topic,
    sourceUrl: article.url,
    versions,
    createdAtIso: new Date().toISOString(),
  };
};

// Single-process in-memory de-dupe of concurrent populate-cache work, keyed
// by `countryCode|topic|dayIso(UTC)`. Multiple concurrent requests for the
// same window share one underlying populate Promise.
const inflight = new Map<string, Promise<NewsItem[]>>();

const buildInflightKey = (countryCode: string, topic: NewsTopic): string =>
  `${countryCode.trim().toLowerCase()}|${topic}|${getNewsDayKey(new Date().toISOString())}`;

const populateTodayNews = async (request: GetTodayNewsRequest): Promise<NewsItem[]> => {
  const articles = await fetchGNewsTopHeadlines({
    countryCode: request.countryCode,
    topic: request.topic,
    max: DESIRED_COUNT,
  });

  const built = await Promise.all(
    articles.map((article) =>
      buildNewsItemFromArticle(article, {
        countryCode: request.countryCode,
        countryName: request.countryName,
        topic: request.topic,
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
    topic: request.topic,
  });
  if (cached.length >= DESIRED_COUNT) {
    return { items: cached.slice(0, DESIRED_COUNT).map(toSummary) };
  }

  const key = buildInflightKey(request.countryCode, request.topic);
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
