import type { IconName } from 'lucide-react/dynamic';

/**
 * CEFR-flavored complexity buckets used for AI rewrites of news articles.
 *
 * - 'beginner' ≈ A1–A2
 * - 'middle'   ≈ B1   (default)
 * - 'advance'  ≈ C1
 */
export type NewsLanguageComplexity = 'beginner' | 'middle' | 'advance';

/**
 * Topic categories we expose to the user. Values match the categories supported
 * by the gNews API (https://gnews.io/docs/v4#search-endpoint-query-parameters).
 */
export type NewsTopic =
  | 'general'
  | 'world'
  | 'nation'
  | 'business'
  | 'technology'
  | 'entertainment'
  | 'sports'
  | 'science'
  | 'health';

/**
 * Three rewritten markdown versions of the same news article keyed by complexity.
 */
export type NewsContentVersions = Record<NewsLanguageComplexity, string>;

/**
 * Cache document shape stored in Firestore under the `news` collection.
 * One document per (countryCode, topic, source url, day).
 */
export interface NewsItem {
  id: string;
  title: string;
  subTitle: string;
  /** Original markdown built from gNews description + content. */
  content_origin: string;
  /** Public URL of the image copied into our storage bucket. */
  imageUrl: string;
  /** Original image URL returned by gNews (kept for debugging / re-upload). */
  sourceImageUrl: string;
  /** ISO timestamp from gNews `publishedAt`. */
  dateIso: string;
  countryCode: string;
  countryName: string;
  topic: NewsTopic;
  sourceUrl: string;
  /** Three rewritten markdown bodies; `null` until AI rewrites complete. */
  versions: NewsContentVersions | null;
  createdAtIso: string;
}

/**
 * Subset of `NewsItem` returned by the list endpoint and rendered on the dashboard.
 */
export interface NewsItemSummary {
  id: string;
  title: string;
  subTitle: string;
  imageUrl: string;
  dateIso: string;
  countryCode: string;
  topic: NewsTopic;
}

/**
 * Visual hint for a news row in the dashboard `StoreCard`.
 */
export interface NewsItemIconHint {
  iconName: IconName;
  iconBgColor: string;
}
