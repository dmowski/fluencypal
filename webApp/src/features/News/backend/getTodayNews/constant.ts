import { NEWS_FETCH_CATEGORIES } from '@/features/News/constants';

/** Articles kept per gNews category during daily population. */
export const ITEMS_PER_CATEGORY = 7;

export const DESIRED_COUNT = NEWS_FETCH_CATEGORIES.length * ITEMS_PER_CATEGORY;
