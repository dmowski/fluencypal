const AD_CLICK_KEYS = ['gclid', 'gbraid', 'wbraid'] as const;
const AD_CLICK_STORAGE_KEY = 'fp_ad_click';
const USER_SOURCE_STORAGE_KEY = 'user_source_info';
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 90;
const MAX_CLICK_ID_LENGTH = 512;

export type AdClickStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

const cleanClickId = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_CLICK_ID_LENGTH) return null;
  if (/[\s;,]/.test(trimmed)) return null;
  return trimmed;
};

const clickIdsFromRecord = (parsed: unknown): Record<string, string> => {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
  const stored: Record<string, string> = {};
  for (const key of AD_CLICK_KEYS) {
    const value = cleanClickId((parsed as Record<string, unknown>)[key]);
    if (value) stored[key] = value;
  }
  return stored;
};

const clickIdsFromJson = (raw: string | null): Record<string, string> => {
  if (!raw) return {};
  try {
    return clickIdsFromRecord(JSON.parse(raw) as unknown);
  } catch {
    return {};
  }
};

const mergeClickIds = (...sources: Array<Record<string, string>>): Record<string, string> => {
  const merged: Record<string, string> = {};
  for (const source of sources) {
    for (const key of AD_CLICK_KEYS) {
      if (!merged[key] && source[key]) merged[key] = source[key];
    }
  }
  return merged;
};

const cookieDomainForHost = (hostname: string): string | null => {
  if (hostname === 'localhost' || hostname === '127.0.0.1') return null;
  if (hostname === 'fluencypal.com' || hostname.endsWith('.fluencypal.com')) {
    return '.fluencypal.com';
  }
  return null;
};

const readStored = (store: AdClickStore): Record<string, string> => {
  try {
    return clickIdsFromJson(store.getItem(AD_CLICK_STORAGE_KEY));
  } catch {
    return {};
  }
};

const clickParamsFromUrl = (href: string): Record<string, string> => {
  try {
    const url = new URL(href, 'https://app.fluencypal.com');
    const found: Record<string, string> = {};
    for (const key of AD_CLICK_KEYS) {
      const value = cleanClickId(url.searchParams.get(key));
      if (value) found[key] = value;
    }
    return found;
  } catch {
    return {};
  }
};

export const captureAdClick = (href: string, store: AdClickStore): void => {
  const found = clickParamsFromUrl(href);
  if (Object.keys(found).length === 0) return;
  store.setItem(AD_CLICK_STORAGE_KEY, JSON.stringify({ ...readStored(store), ...found }));
};

export const parseAdClickCookie = (cookie: string): Record<string, string> => {
  const parts = cookie.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${AD_CLICK_STORAGE_KEY}=`)) continue;
    try {
      return clickIdsFromJson(decodeURIComponent(trimmed.slice(AD_CLICK_STORAGE_KEY.length + 1)));
    } catch {
      return {};
    }
  }
  return {};
};

export const serializeAdClickCookie = (
  ids: Record<string, string>,
  hostname: string,
  secure: boolean,
): string | null => {
  const cleaned = clickIdsFromRecord(ids);
  if (Object.keys(cleaned).length === 0) return null;
  const pieces = [
    `${AD_CLICK_STORAGE_KEY}=${encodeURIComponent(JSON.stringify(cleaned))}`,
    'Path=/',
    `Max-Age=${COOKIE_MAX_AGE_SEC}`,
    'SameSite=Lax',
  ];
  const domain = cookieDomainForHost(hostname);
  if (domain) pieces.push(`Domain=${domain}`);
  if (secure) pieces.push('Secure');
  return pieces.join('; ');
};

/** Session, then the shared cookie, then the first-touch user source. */
export const clickIdsForRestore = (input: {
  sessionRaw: string | null;
  cookie: string;
  userSourceRaw: string | null;
}): Record<string, string> => {
  return mergeClickIds(
    clickIdsFromJson(input.sessionRaw),
    parseAdClickCookie(input.cookie),
    clickIdsFromJson(input.userSourceRaw),
  );
};

export const appendAdClickIds = (url: URL, ids: Record<string, string>): void => {
  for (const key of AD_CLICK_KEYS) {
    const value = ids[key];
    if (value && !url.searchParams.get(key)) url.searchParams.set(key, value);
  }
};

const storageGet = (storage: Storage, key: string): string | null => {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
};

export const browserClickIds = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  return clickIdsForRestore({
    sessionRaw: storageGet(window.sessionStorage, AD_CLICK_STORAGE_KEY),
    cookie: document.cookie,
    userSourceRaw: storageGet(window.localStorage, USER_SOURCE_STORAGE_KEY),
  });
};

/** Keep the click id for the app on another subdomain and in a later tab. */
export const persistBrowserAdClick = (): void => {
  if (typeof window === 'undefined') return;
  try {
    captureAdClick(window.location.href, window.sessionStorage);
  } catch {
    // Session storage can be blocked. The cookie below still carries the URL click id.
  }
  const ids = browserClickIds();
  const cookie = serializeAdClickCookie(
    { ...ids, ...clickParamsFromUrl(window.location.href) },
    window.location.hostname,
    window.location.protocol === 'https:',
  );
  if (cookie) document.cookie = cookie;
};

/** URL with the stored ad click id filled in, or null when nothing needs adding. */
export const urlWithClickIds = (href: string, stored: Record<string, string>): string | null => {
  if (Object.keys(stored).length === 0) return null;
  try {
    const url = new URL(href, 'https://app.fluencypal.com');
    const before = url.toString();
    appendAdClickIds(url, stored);
    return url.toString() === before ? null : url.toString();
  } catch {
    return null;
  }
};

export const adClickUrl = (href: string, store: AdClickStore): string | null => {
  return urlWithClickIds(href, readStored(store));
};
