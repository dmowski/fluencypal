import { ANALYTICS_VISITOR_COOKIE, ANALYTICS_VISITOR_QUERY, ANALYTICS_VISITOR_STORAGE_KEY } from './constants';
import { createVisitorId, isValidVisitorId } from './visitorId';

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365;

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
    if (!trimmed.startsWith(`${ANALYTICS_VISITOR_COOKIE}=`)) continue;
    const value = decodeURIComponent(trimmed.slice(ANALYTICS_VISITOR_COOKIE.length + 1));
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
    `${ANALYTICS_VISITOR_COOKIE}=${encodeURIComponent(visitorId)}`,
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
    const stored = window.localStorage.getItem(ANALYTICS_VISITOR_STORAGE_KEY);
    return stored && isValidVisitorId(stored) ? stored : null;
  } catch {
    return null;
  }
};

const persistStoredVisitorId = (visitorId: string): void => {
  try {
    window.localStorage.setItem(ANALYTICS_VISITOR_STORAGE_KEY, visitorId);
  } catch {
    // Private mode can block storage.
  }
};

const persistVisitorCookie = (visitorId: string): void => {
  document.cookie = serializeVisitorCookie(
    visitorId,
    window.location.hostname,
    window.location.protocol === 'https:',
  );
};

export const persistParentVisitorId = (visitorId: string): void => {
  if (typeof window === 'undefined' || !isValidVisitorId(visitorId)) return;
  persistStoredVisitorId(visitorId);
  persistVisitorCookie(visitorId);
};

export const consumeVisitorIdFromLocation = (): string | null => {
  if (typeof window === 'undefined') return null;
  const fromUrl = visitorIdFromSearch(window.location.search);
  if (!fromUrl) return null;
  const url = new URL(window.location.href);
  url.searchParams.delete(ANALYTICS_VISITOR_QUERY);
  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(window.history.state, '', next);
  return fromUrl;
};

export const getOrCreateParentVisitorId = (): string => {
  if (typeof window === 'undefined') return createVisitorId();
  const fromUrl = consumeVisitorIdFromLocation();
  const fromCookie = visitorIdFromCookieString(document.cookie);
  const fromStorage = readStoredVisitorId();
  const visitorId = fromUrl || fromCookie || fromStorage || createVisitorId();
  persistParentVisitorId(visitorId);
  return visitorId;
};
