import { NewsItem } from '@/features/News/types';
import { getCachedNewsById } from './cache';
import { mergeNewsItemWithExisting } from './mergeNewsItemWithExisting';

export const mergeBuiltNewsWithCache = async (built: NewsItem): Promise<NewsItem> => {
  const existing = await getCachedNewsById(built.id);
  return mergeNewsItemWithExisting(built, existing);
};
