const FIREBASE_EMAIL_LINK_PARAMS = ['oobCode', 'mode', 'apiKey', 'continueUrl', 'lang'] as const;

export const DAY_PASS_EMAIL_RETURN_KEY = 'fp_dayPassEmailReturn';

const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type DayPassEmailReturn = {
  pathname: string;
  search: string;
  savedAt: number;
};

const stripFirebaseEmailLinkParams = (url: URL): void => {
  for (const key of FIREBASE_EMAIL_LINK_PARAMS) {
    url.searchParams.delete(key);
  }
};

/** Continue URL for a day-pass confirmation, without Firebase email-link params. */
export const dayPassConfirmUrlFromHref = (href: string): string | null => {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (url.searchParams.get('paymentConfirm') !== 'true') return null;
  stripFirebaseEmailLinkParams(url);
  if (url.searchParams.get('paymentModal') !== 'true') {
    url.searchParams.set('paymentModal', 'true');
  }
  if (!url.searchParams.get('paymentDuration')) {
    url.searchParams.set('paymentDuration', 'day');
  }
  return url.toString();
};

const readStoredReturn = (): DayPassEmailReturn | null => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(DAY_PASS_EMAIL_RETURN_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DayPassEmailReturn;
    if (!parsed?.pathname || typeof parsed.search !== 'string' || !parsed.savedAt) return null;
    if (!new URLSearchParams(parsed.search).get('paymentConfirm')) return null;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      window.localStorage.removeItem(DAY_PASS_EMAIL_RETURN_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

/**
 * Remember the day-pass confirmation and return the continue URL to put in the
 * email link. Other pages return null so the caller keeps the current href.
 */
export const rememberDayPassEmailReturn = (href: string): string | null => {
  const continueUrl = dayPassConfirmUrlFromHref(href);
  if (!continueUrl || typeof window === 'undefined') return continueUrl;
  const url = new URL(continueUrl);
  const payload: DayPassEmailReturn = {
    pathname: url.pathname,
    search: url.search,
    savedAt: Date.now(),
  };
  window.localStorage.setItem(DAY_PASS_EMAIL_RETURN_KEY, JSON.stringify(payload));
  return continueUrl;
};

/**
 * After the email link signs them in, the page to open when this one is not
 * the lesson confirmation. Returns null when they are already there.
 */
export const dayPassEmailReturnTarget = (currentHref: string): string | null => {
  const stored = readStoredReturn();
  if (!stored) return null;
  let current: URL;
  try {
    current = new URL(currentHref);
  } catch {
    return null;
  }
  stripFirebaseEmailLinkParams(current);
  const currentKey = `${current.pathname}${current.search}`;
  const targetKey = `${stored.pathname}${stored.search}`;
  if (currentKey === targetKey) {
    window.localStorage.removeItem(DAY_PASS_EMAIL_RETURN_KEY);
    return null;
  }
  return `${current.origin}${stored.pathname}${stored.search}`;
};
