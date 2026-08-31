const KEPT_QUERY_KEYS = ['currentStep', 'rolePlayId', 'interactiveLesson', 'dailyQuestions'] as const;

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

export const stripVisitorIdFromHref = (href: string, queryKey: string): string => {
  try {
    const url = new URL(href);
    url.searchParams.delete(queryKey);
    return url.toString();
  } catch {
    return href;
  }
};

export const isInternalAnalyticsHost = (host: string | null | undefined): boolean => {
  if (!host) return false;
  return host.includes('localhost') || host.includes('127.0.0.1');
};

export const isInternalAnalyticsPath = (path: string | null | undefined): boolean => {
  if (!path) return false;
  return path === '/testUi' || path.startsWith('/testUi/') || path.startsWith('/testUi?');
};
