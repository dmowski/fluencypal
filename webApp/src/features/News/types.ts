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
 * Three rewritten markdown versions of the same news article keyed by complexity.
 * The text is in the user's target learning language (see `NewsItem.languageCode`).
 */
export type NewsContentVersions = Record<NewsLanguageComplexity, string>;

/**
 * Cache document shape stored in Firestore under the `news` collection.
 *
 * One document per `(countryCode, languageCode, UTC day, source url)`. The
 * `dayKey` field is the UTC `YYYY-MM-DD` slice we computed at cache-write time
 * (NOT the article's `publishedAt`) so today's lookups are guaranteed to hit
 * what was populated today.
 */
export interface NewsItem {
  id: string;
  /** Title translated into the user's target language. */
  title: string;
  /** Subtitle translated into the user's target language. */
  subTitle: string;
  /** Original title as returned by the source — kept for debugging / fallback. */
  titleOrigin: string;
  /** Original subtitle as returned by the source — kept for debugging / fallback. */
  subTitleOrigin: string;
  /** Original markdown built from gNews description + content. */
  content_origin: string;
  /** Public URL of the image copied into our storage bucket. */
  imageUrl: string;
  /** Original image URL returned by gNews (kept for debugging / re-upload). */
  sourceImageUrl: string;
  /** ISO timestamp from gNews `publishedAt`. */
  dateIso: string;
  /** UTC `YYYY-MM-DD` of the day this cache document was populated. */
  dayKey: string;
  countryCode: string;
  countryName: string;
  /** Target learning language code (e.g. 'en', 'es', 'de'). */
  languageCode: string;
  /** English display name of the target language (e.g. 'English', 'Spanish'). */
  languageName: string;
  sourceUrl: string;
  /** Three rewritten markdown bodies (in target language); `null` until AI rewrites complete. */
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
  languageCode: string;
}

/**
 * Visual hint for a news row in the dashboard `StoreCard`.
 */
export interface NewsItemIconHint {
  iconName: IconName;
  iconBgColor: string;
}
