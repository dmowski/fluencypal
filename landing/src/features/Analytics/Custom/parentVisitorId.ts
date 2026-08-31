const VISITOR_ID_PATTERN =
  /^fpv_[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STORAGE_KEY = 'fp_custom_analytics_visitor_id';
export const ANALYTICS_VISITOR_QUERY = 'fpv';
const COOKIE_NAME = 'fp_vid';
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365;

export const createVisitorId = (): string => `fpv_${crypto.randomUUID()}`;

export const isValidVisitorId = (visitorId: string): boolean => VISITOR_ID_PATTERN.test(visitorId);

export const isFluencyPalAppHost = (hostname: string): boolean => {
  return hostname === 'app.fluencypal.com' || hostname === 'localhost' || hostname === '127.0.0.1';
};

export const cookieDomainForHost = (hostname: string): string | null => {
  if (hostname === 'localhost' || hostname === '127.0.0.1') return null;
  if (hostname === 'fluencypal.com' || hostname.endsWith('.fluencypal.com')) {
    return '.fluencypal.com';
  }
  return null;
};

export const visitorIdFromSearch = (search: string): string | null => {
  try {
    const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
    const value = params.get(ANALYTICS_VISITOR_QUERY) || '';
    return isValidVisitorId(value) ? value : null;
  } catch {
    return null;
  }
};

export const visitorIdFromCookieString = (cookie: string): string | null => {
  const parts = cookie.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${COOKIE_NAME}=`)) continue;
    const value = decodeURIComponent(trimmed.slice(COOKIE_NAME.length + 1));
    return isValidVisitorId(value) ? value : null;
  }
  return null;
};

export const serializeVisitorCookie = (
  visitorId: string,
  hostname: string,
  secure: boolean,
): string => {
  const pieces = [
    `${COOKIE_NAME}=${encodeURIComponent(visitorId)}`,
    'Path=/',
    `Max-Age=${COOKIE_MAX_AGE_SEC}`,
    'SameSite=Lax',
  ];
  const domain = cookieDomainForHost(hostname);
  if (domain) pieces.push(`Domain=${domain}`);
  if (secure) pieces.push('Secure');
  return pieces.join('; ');
};

export const decorateAppHref = (href: string, visitorId: string, baseHref?: string): string => {
  if (!href || !isValidVisitorId(visitorId)) return href;
  try {
    const url = new URL(href, baseHref || 'https://www.fluencypal.com');
    if (!isFluencyPalAppHost(url.hostname)) return href;
    if (url.searchParams.get(ANALYTICS_VISITOR_QUERY)) return url.toString();
    url.searchParams.set(ANALYTICS_VISITOR_QUERY, visitorId);
    return url.toString();
  } catch {
    return href;
  }
};

const readStoredVisitorId = (): string | null => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored && isValidVisitorId(stored) ? stored : null;
  } catch {
    return null;
  }
};

export const persistParentVisitorId = (visitorId: string): void => {
  if (typeof window === 'undefined' || !isValidVisitorId(visitorId)) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, visitorId);
  } catch {
    // Private mode can block storage.
  }
  document.cookie = serializeVisitorCookie(
    visitorId,
    window.location.hostname,
    window.location.protocol === 'https:',
  );
};

export const getOrCreateParentVisitorId = (): string => {
  if (typeof window === 'undefined') return createVisitorId();
  const fromCookie = visitorIdFromCookieString(document.cookie);
  const fromStorage = readStoredVisitorId();
  const visitorId = fromCookie || fromStorage || createVisitorId();
  persistParentVisitorId(visitorId);
  return visitorId;
};
