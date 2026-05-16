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
