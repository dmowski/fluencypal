import type { NewsItem, NewsItemSummary } from '@/features/News/types';

/**
 * Shared request/response contracts for the `/api/news/*` endpoints.
 * Mirrors the pattern in `webApp/src/app/api/translate/types.ts`.
 */

export interface GetTodayNewsRequest {
  countryCode: string;
  countryName: string;
  /** User's target learning language code (e.g. 'en', 'es'). */
  languageCode: string;
  /** English display name of the target language (e.g. 'English', 'Spanish'). */
  languageName: string;
}

export interface GetTodayNewsResponse {
  items: NewsItemSummary[];
}

export interface GetNewsByIdRequest {
  id: string;
}

export interface GetNewsByIdResponse {
  item: NewsItem | null;
}

export interface GetPreviousDayNewsRequest {
  countryCode: string;
  languageCode: string;
  /** How many days back to fetch. Defaults to 1 (yesterday). */
  daysBack?: number;
}

export interface GetPreviousDayNewsResponse {
  items: NewsItemSummary[];
}
