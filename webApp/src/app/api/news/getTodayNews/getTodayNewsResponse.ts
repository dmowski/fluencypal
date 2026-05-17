import { NewsItem, NewsItemSummary } from '@/features/News/types';
import { GetTodayNewsRequest, GetTodayNewsResponse } from '../types';
import { buildNewsId, getNewsDayKey } from '../buildNewsId';
import { getCachedTodayNews, upsertCachedNews } from '../cache';
import { copyNewsImageToStorage } from '../copyImageToStorage';
import { fetchGNewsTopHeadlines, RawGNewsArticle } from '../fetchGNews';
import { rewriteNewsForLevels } from '../rewriteNewsForLevels';
import { translateNewsHeadline } from '../translateNewsHeadline';
import { generateStrictJson } from '../../ai/generateJson';
import { DESIRED_COUNT } from './constant';
import {
  buildNewsPositivityFilterSystemPrompt,
  buildNewsPositivityFilterUserPrompt,
} from '../prompts';
import { z } from 'zod';

const CANDIDATES_COUNT = 25;
const FILTER_BATCH_SIZE = 5;

const positivityFilterSchema = z.object({
  keepIndexes: z.array(z.number().int()).default([]),
});

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

const getNonNegativeIndexesInBatch = async (
  batch: Array<{ title: string; subTitle: string }>,
): Promise<number[]> => {
  const { parsed } = await generateStrictJson({
    systemMessage: buildNewsPositivityFilterSystemPrompt(),
    userMessage: buildNewsPositivityFilterUserPrompt(batch),
    model: 'gpt-4o-mini',
    schema: positivityFilterSchema,
    attempts: 2,
  });

  const keepIndexes = parsed.keepIndexes;

  return keepIndexes
    .filter((value): value is number => Number.isInteger(value))
    .filter((index) => index >= 0 && index < batch.length);
};

const pickNonNegativeArticles = async (
  articles: RawGNewsArticle[],
  desiredCount: number,
): Promise<RawGNewsArticle[]> => {
  const selected: RawGNewsArticle[] = [];

  for (
    let start = 0;
    start < articles.length && selected.length < desiredCount;
    start += FILTER_BATCH_SIZE
  ) {
    const batch = articles.slice(start, start + FILTER_BATCH_SIZE);
    let keepIndexes: number[] = [];

    try {
      keepIndexes = await getNonNegativeIndexesInBatch(
        batch.map((article) => ({
          title: article.title ?? '',
          subTitle: article.description ?? '',
        })),
      );
    } catch {
      // If AI filtering fails, fallback to keeping this batch to avoid empty UI.
      keepIndexes = batch.map((_, index) => index);
    }

    for (const index of keepIndexes) {
      selected.push(batch[index]);
      if (selected.length >= desiredCount) {
        break;
      }
    }
  }

  return selected;
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
  const candidates = await fetchGNewsTopHeadlines({
    countryCode: request.countryCode,
    max: CANDIDATES_COUNT,
  });

  const articles = await pickNonNegativeArticles(candidates, DESIRED_COUNT);

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
