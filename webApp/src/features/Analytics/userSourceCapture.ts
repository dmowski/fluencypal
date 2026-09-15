import { UserSource } from '@/features/Analytics/analytics';
import {
  ANALYTICS_SOURCE_HREF_QUERY,
  ANALYTICS_SOURCE_REFERRER_QUERY,
  ANALYTICS_TRACKER_PATH,
  ANALYTICS_VISITOR_QUERY,
} from '@/features/Analytics/Custom/constants';

export const SOURCE_STORAGE_KEY = 'user_source_info';

const INTERNAL_QUERY_KEYS = [
  ANALYTICS_VISITOR_QUERY,
  ANALYTICS_SOURCE_HREF_QUERY,
  ANALYTICS_SOURCE_REFERRER_QUERY,
] as const;

const pathnameOf = (rawPath: string): string => {
  const path = rawPath.trim();
  if (!path) return '';
  try {
    const url = /^https?:\/\//i.test(path)
      ? new URL(path)
      : new URL(path, 'https://app.fluencypal.com');
    return url.pathname || '';
  } catch {
    return path.split('?')[0] || '';
  }
};

const isFluencyPalHost = (hostname: string): boolean => {
  return hostname === 'fluencypal.com' || hostname.endsWith('.fluencypal.com');
};

export const isIgnoredUserSourcePath = (urlPath: string | null | undefined): boolean => {
  const pathname = pathnameOf(urlPath || '');
  return pathname === ANALYTICS_TRACKER_PATH || pathname.startsWith(`${ANALYTICS_TRACKER_PATH}/`);
};

const searchParam = (url: URL, key: string): string | null => url.searchParams.get(key);

const toStoredUrlPath = (url: URL): string => {
  const cleaned = new URL(url.toString());
  for (const key of INTERNAL_QUERY_KEYS) {
    cleaned.searchParams.delete(key);
  }
  const search = cleaned.searchParams.toString();
  return `${cleaned.pathname}${search ? `?${search}` : ''}`;
};

export const buildUserSource = (href: string, referrer: string): UserSource | null => {
  try {
    const url = new URL(href, 'https://app.fluencypal.com');
    const urlPath = toStoredUrlPath(url);
    if (isIgnoredUserSourcePath(urlPath)) return null;

    return {
      urlPath,
      referrer: referrer || '',
      utmSource: searchParam(url, 'utm_source'),
      utmMedium: searchParam(url, 'utm_medium'),
      utmCampaign: searchParam(url, 'utm_campaign'),
      utmTerm: searchParam(url, 'utm_term'),
      utmContent: searchParam(url, 'utm_content'),
      gclid: searchParam(url, 'gclid'),
      gbraid: searchParam(url, 'gbraid'),
      wbraid: searchParam(url, 'wbraid'),
    };
  } catch {
    return null;
  }
};

export const captureUserSourceFromTrackerSearch = (search: string): UserSource | null => {
  try {
    const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
    const href = params.get(ANALYTICS_SOURCE_HREF_QUERY);
    if (!href) return null;
    return buildUserSource(href, params.get(ANALYTICS_SOURCE_REFERRER_QUERY) || '');
  } catch {
    return null;
  }
};

export const getParamsFromStorage = (): UserSource | null => {
  if (typeof window === 'undefined') return null;

  try {
    const stored = window.localStorage.getItem(SOURCE_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as UserSource;
    if (!parsed?.urlPath || isIgnoredUserSourcePath(parsed.urlPath)) return null;
    return parsed;
  } catch {
    // Third-party iframes and some privacy modes deny localStorage.
    return null;
  }
};

export const persistUserSource = (source: UserSource): void => {
  try {
    window.localStorage.setItem(SOURCE_STORAGE_KEY, JSON.stringify(source));
  } catch {
    // Keep the in-memory source even when storage is blocked.
  }
};

export const persistUserSourceIfAbsent = (source: UserSource | null): UserSource | null => {
  const existing = getParamsFromStorage();
  if (existing) return existing;
  if (!source) return null;
  persistUserSource(source);
  return source;
};

export const referrerHostOf = (referrer: string): string => {
  if (!referrer) return '';
  try {
    return new URL(referrer).host;
  } catch {
    return referrer;
  }
};

const mergeAttribution = (primary: UserSource, fallback: UserSource): UserSource => ({
  ...primary,
  utmSource: primary.utmSource || fallback.utmSource,
  utmMedium: primary.utmMedium || fallback.utmMedium,
  utmCampaign: primary.utmCampaign || fallback.utmCampaign,
  utmTerm: primary.utmTerm || fallback.utmTerm,
  utmContent: primary.utmContent || fallback.utmContent,
  gclid: primary.gclid || fallback.gclid,
  gbraid: primary.gbraid || fallback.gbraid,
  wbraid: primary.wbraid || fallback.wbraid,
});

export const resolveDisplayUserSource = (source: UserSource | null | undefined): UserSource | null => {
  if (!source) return null;
  if (!isIgnoredUserSourcePath(source.urlPath)) return source;
  if (!source.referrer) return source;

  try {
    const referrerUrl = new URL(source.referrer);
    if (!isFluencyPalHost(referrerUrl.hostname)) return source;
    const fromReferrer = buildUserSource(source.referrer, '');
    if (!fromReferrer) return source;
    return mergeAttribution(fromReferrer, source);
  } catch {
    return source;
  }
};

export const formatUserSourceLabel = (source: UserSource | null | undefined): string | null => {
  const resolved = resolveDisplayUserSource(source);
  if (!resolved) return null;

  const path = isIgnoredUserSourcePath(resolved.urlPath) ? '' : (resolved.urlPath || '').trim();
  const parts: string[] = [];
  if (path) parts.push(path);

  const pathAlreadyHasUtm = /(?:\?|&)(utm_|gclid|gbraid|wbraid)/i.test(path);
  if (!pathAlreadyHasUtm) {
    const utmBits = [
      resolved.utmSource && `utm_source=${resolved.utmSource}`,
      resolved.utmMedium && `utm_medium=${resolved.utmMedium}`,
      resolved.utmCampaign && `utm_campaign=${resolved.utmCampaign}`,
      resolved.utmTerm && `utm_term=${resolved.utmTerm}`,
      resolved.utmContent && `utm_content=${resolved.utmContent}`,
      resolved.gclid && 'gclid',
      resolved.gbraid && 'gbraid',
      resolved.wbraid && 'wbraid',
    ].filter(Boolean) as string[];
    parts.push(...utmBits);
  }

  const referrerHost = referrerHostOf(resolved.referrer);
  if (referrerHost && !path.includes(referrerHost)) {
    const isOwnSite = isFluencyPalHost(referrerHost);
    if (!isOwnSite || !path) {
      parts.push(`ref=${referrerHost}`);
    }
  }

  return parts.length ? parts.join(' · ') : null;
};
