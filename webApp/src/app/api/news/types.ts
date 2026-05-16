import type { NewsItem, NewsItemSummary, NewsTopic } from '@/features/News/types';

/**
 * Shared request/response contracts for the `/api/news/*` endpoints.
 * Mirrors the pattern in `webApp/src/app/api/translate/types.ts`.
 */

export interface GetTodayNewsRequest {
  countryCode: string;
  countryName: string;
  topic: NewsTopic;
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
