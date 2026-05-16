import type { IconName } from 'lucide-react/dynamic';
import type { NewsItemIconHint, NewsLanguageComplexity, NewsTopic } from './types';

export const DEFAULT_NEWS_COMPLEXITY: NewsLanguageComplexity = 'middle';
export const DEFAULT_NEWS_TOPIC: NewsTopic = 'general';

/** Number of news items shown in the dashboard card. */
export const NEWS_DASHBOARD_ITEMS_COUNT = 3;

/** All topics in the order they should appear in the settings menu. */
export const NEWS_TOPIC_OPTIONS: NewsTopic[] = [
  'general',
  'world',
  'nation',
  'business',
  'technology',
  'entertainment',
  'sports',
  'science',
  'health',
];

/** All complexity levels in the order they should appear in the settings menu. */
export const NEWS_COMPLEXITY_OPTIONS: NewsLanguageComplexity[] = ['beginner', 'middle', 'advance'];

/**
 * Display labels are intentionally plain English strings; they are wrapped with
 * `i18n._()` at the call site so lingui can extract them.
 */
export const NEWS_TOPIC_LABELS: Record<NewsTopic, string> = {
  general: 'General',
  world: 'World',
  nation: 'Nation',
  business: 'Business',
  technology: 'Technology',
  entertainment: 'Entertainment',
  sports: 'Sports',
  science: 'Science',
  health: 'Health',
};

export const NEWS_COMPLEXITY_LABELS: Record<NewsLanguageComplexity, string> = {
  beginner: 'Beginner',
  middle: 'Middle',
  advance: 'Advanced',
};

/**
 * gNews top-headlines endpoint only supports a fixed list of country codes.
 * Picking any other code (e.g. `pl` for Poland) silently returns 0 articles,
 * which the dashboard then renders as "No news yet for your country today".
 *
 * Keep this list in sync with https://gnews.io/docs (Top Headlines → country).
 * `code` is the alpha-2 lowercased ID we send to gNews; `name` is the display
 * label shown in the news settings menu and used as the card badge.
 */
export interface NewsCountryOption {
  code: string;
  name: string;
}

export const NEWS_SUPPORTED_COUNTRIES: NewsCountryOption[] = [
  { code: 'au', name: 'Australia' },
  { code: 'br', name: 'Brazil' },
  { code: 'ca', name: 'Canada' },
  { code: 'cn', name: 'China' },
  { code: 'eg', name: 'Egypt' },
  { code: 'fr', name: 'France' },
  { code: 'de', name: 'Germany' },
  { code: 'gr', name: 'Greece' },
  { code: 'hk', name: 'Hong Kong' },
  { code: 'in', name: 'India' },
  { code: 'ie', name: 'Ireland' },
  { code: 'il', name: 'Israel' },
  { code: 'it', name: 'Italy' },
  { code: 'jp', name: 'Japan' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'no', name: 'Norway' },
  { code: 'pk', name: 'Pakistan' },
  { code: 'pe', name: 'Peru' },
  { code: 'ph', name: 'Philippines' },
  { code: 'pt', name: 'Portugal' },
  { code: 'ro', name: 'Romania' },
  { code: 'ru', name: 'Russia' },
  { code: 'sg', name: 'Singapore' },
  { code: 'es', name: 'Spain' },
  { code: 'se', name: 'Sweden' },
  { code: 'ch', name: 'Switzerland' },
  { code: 'tw', name: 'Taiwan' },
  { code: 'ua', name: 'Ukraine' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'us', name: 'United States' },
];

/** Quick lookup of display name by alpha-2 code. */
export const NEWS_COUNTRY_NAME_BY_CODE: Record<string, string> = Object.fromEntries(
  NEWS_SUPPORTED_COUNTRIES.map(({ code, name }) => [code, name]),
);

/**
 * Per-row icon/color hints for the dashboard `StoreCard`. Cycled by index so
 * the list stays visually varied without per-topic logic.
 */
export const NEWS_ITEM_ICON_HINTS: NewsItemIconHint[] = [
  { iconName: 'newspaper' as IconName, iconBgColor: '#335FFC' },
  { iconName: 'globe' as IconName, iconBgColor: '#FF6AD8' },
  { iconName: 'radio' as IconName, iconBgColor: '#00C2FF' },
  { iconName: 'megaphone' as IconName, iconBgColor: '#FF8A00' },
  { iconName: 'flame' as IconName, iconBgColor: '#00FFAB' },
];
