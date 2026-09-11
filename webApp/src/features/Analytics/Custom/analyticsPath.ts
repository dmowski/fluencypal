const KEPT_QUERY_KEYS = [
  'currentStep',
  'rolePlayId',
  'interactiveLesson',
  'dailyQuestions',
  'justTalk',
] as const;

export const normalizeAnalyticsPath = (path: string): string => {
  const raw = path.trim() || '/';
  try {
    const url = new URL(raw, 'https://app.fluencypal.com');
    const kept = new URLSearchParams();
    for (const key of KEPT_QUERY_KEYS) {
      const value = url.searchParams.get(key);
      if (value) kept.set(key, value);
    }
    const search = kept.toString();
    const pathname = url.pathname || '/';
    return search ? `${pathname}?${search}` : pathname;
  } catch {
    return raw.split('?')[0] || '/';
  }
};

const pathnameOf = (path: string): string => {
  try {
    return new URL(normalizeAnalyticsPath(path), 'https://app.fluencypal.com').pathname || '/';
  } catch {
    return path.split('?')[0] || '/';
  }
};

const pathnameWithoutLang = (pathname: string): string => {
  return pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';
};

export const quizStepFromAnalyticsPath = (path: string): string | null => {
  const normalized = normalizeAnalyticsPath(path);
  if (!/(^|\/)quiz(\/|$|\?)/i.test(normalized)) return null;
  try {
    const url = new URL(normalized, 'https://app.fluencypal.com');
    return url.searchParams.get('currentStep') || 'start';
  } catch {
    return 'start';
  }
};

export type AnalyticsEntryKind =
  | 'home'
  | 'scenario'
  | 'blog'
  | 'quiz'
  | 'practice'
  | 'pricing'
  | 'features'
  | 'other';

export const entryKindFromAnalyticsPath = (path: string): AnalyticsEntryKind => {
  const withoutLang = pathnameWithoutLang(pathnameOf(path)).toLowerCase();
  if (
    /\/scenarios(\/|$)/.test(withoutLang) ||
    withoutLang === '/alias' ||
    withoutLang.startsWith('/alias/')
  ) {
    return 'scenario';
  }
  if (/\/blog(\/|$)/.test(withoutLang)) return 'blog';
  if (/\/quiz(\/|$)/.test(withoutLang)) return 'quiz';
  if (/\/practice(\/|$)/.test(withoutLang)) return 'practice';
  if (/\/pricing(\/|$)/.test(withoutLang) || /\/price(\/|$)/.test(withoutLang)) return 'pricing';
  if (/\/features(\/|$)/.test(withoutLang)) return 'features';
  if (withoutLang === '/') return 'home';
  return 'other';
};

export const stripVisitorIdFromHref = (href: string, queryKey: string): string => {
  try {
    const url = new URL(href);
    url.searchParams.delete(queryKey);
    return url.toString();
  } catch {
    return href;
  }
};

export const INTERNAL_ANALYTICS_AUTH_USER_IDS = ['Mq2HfU3KrXTjNyOpPXqHSPg5izV2'] as const;

export const isInternalAnalyticsHost = (host: string | null | undefined): boolean => {
  if (!host) return false;
  return host.includes('localhost') || host.includes('127.0.0.1');
};

export const isInternalAnalyticsPath = (path: string | null | undefined): boolean => {
  if (!path) return false;
  return path === '/testUi' || path.startsWith('/testUi/') || path.startsWith('/testUi?');
};

export const isInternalAnalyticsAuthUserId = (uid: string | null | undefined): boolean => {
  if (!uid) return false;
  return (INTERNAL_ANALYTICS_AUTH_USER_IDS as readonly string[]).includes(uid);
};
