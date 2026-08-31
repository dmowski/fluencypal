export const ANALYTICS_MESSAGE_SOURCE = 'fp-custom-analytics';
export const ANALYTICS_TRACKER_PATH = '/analytics/tracker';
export const PRODUCTION_APP_ORIGIN = 'https://app.fluencypal.com';
export const LOCAL_APP_ORIGIN = 'http://localhost:3000';

export type LandingAnalyticsEventName = 'page_view' | 'click' | 'scroll_depth' | 'page_leave';

export type LandingAnalyticsEvent = {
  name: LandingAnalyticsEventName;
  sourceApp: 'landing';
  path: string;
  href: string;
  title: string;
  referrer: string;
  language: string;
  screen: { width: number; height: number };
  buttonId?: string;
  buttonText?: string;
  buttonHref?: string;
  tagName?: string;
  ctaId?: string;
  ctaIntent?: 'quiz' | 'signin' | 'practice' | 'pricing' | 'other';
  scrollPct?: number;
  durationMs?: number;
  maxScrollPct?: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  gclid?: string;
  referrerHost?: string;
};

export type LandingParentToIframeMessage =
  | {
      source: typeof ANALYTICS_MESSAGE_SOURCE;
      type: 'event';
      event: LandingAnalyticsEvent;
      visitorId?: string;
    }
  | {
      source: typeof ANALYTICS_MESSAGE_SOURCE;
      type: 'hello';
      visitorId?: string;
    };

export const getTrackerOrigin = (): string => {
  if (typeof window === 'undefined') {
    return PRODUCTION_APP_ORIGIN;
  }
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return LOCAL_APP_ORIGIN;
  }
  return PRODUCTION_APP_ORIGIN;
};

export const getTrackerUrl = (): string => {
  return `${getTrackerOrigin()}${ANALYTICS_TRACKER_PATH}`;
};

export const isReadyMessage = (data: unknown): boolean => {
  if (!data || typeof data !== 'object') return false;
  const record = data as { source?: unknown; type?: unknown };
  return record.source === ANALYTICS_MESSAGE_SOURCE && record.type === 'ready';
};

export const buildEventMessage = (
  event: LandingAnalyticsEvent,
  visitorId?: string,
): LandingParentToIframeMessage => {
  return {
    source: ANALYTICS_MESSAGE_SOURCE,
    type: 'event',
    event,
    ...(visitorId ? { visitorId } : {}),
  };
};

export const buildHelloMessage = (visitorId?: string): LandingParentToIframeMessage => {
  return {
    source: ANALYTICS_MESSAGE_SOURCE,
    type: 'hello',
    ...(visitorId ? { visitorId } : {}),
  };
};

export const isAllowedAnalyticsOrigin = (origin: string): boolean => {
  if (!origin) return false;
  if (origin === 'https://www.fluencypal.com') return true;
  if (origin === 'https://app.fluencypal.com') return true;
  if (origin === 'https://book.fluencypal.com') return true;
  try {
    const url = new URL(origin);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return true;
    if (url.protocol === 'https:' && url.hostname.endsWith('.fluencypal.com')) return true;
  } catch {
    return false;
  }
  return false;
};

const BOT_PATTERN =
  /bot|crawler|spider|crawling|preview|headless|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|discord|slackbot|twitterbot|linkedinbot|semrush|ahrefs|gptbot|claudebot|bytespider|lighthouse|playwright|puppeteer|cypress|wget|curl|python-requests/i;

export const isBotBrowser = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  if (navigator.webdriver) return true;
  return BOT_PATTERN.test(navigator.userAgent || '');
};

export const classifyCta = (input: { href?: string; buttonId?: string }) => {
  const buttonId = (input.buttonId || '').trim();
  const rawHref = (input.href || '').trim();
  let path = '';
  try {
    path = rawHref
      ? /^https?:\/\//i.test(rawHref)
        ? new URL(rawHref).pathname.toLowerCase()
        : rawHref.split('?')[0].toLowerCase()
      : '';
  } catch {
    path = rawHref.split('?')[0].toLowerCase();
  }
  const hasSegment = (segment: string) => new RegExp(`(^|/)${segment}(/|$)`, 'i').test(path);
  const id = buttonId.toLowerCase();
  if (id.includes('sign-in') || id.includes('signin') || id === 'header-sign-in') {
    return { ctaId: buttonId || 'header-sign-in', ctaIntent: 'signin' as const };
  }
  if (id.includes('returning') || id === 'returning-practice') {
    return { ctaId: buttonId || 'returning-practice', ctaIntent: 'signin' as const };
  }
  if (id.includes('quiz') || hasSegment('quiz')) {
    return { ctaId: buttonId || 'quiz', ctaIntent: 'quiz' as const };
  }
  if (hasSegment('pricing') || hasSegment('price')) {
    return { ctaId: buttonId || 'pricing', ctaIntent: 'pricing' as const };
  }
  if (hasSegment('practice')) {
    return { ctaId: buttonId || 'practice', ctaIntent: 'practice' as const };
  }
  return { ctaId: buttonId || 'other', ctaIntent: 'other' as const };
};

export const parseTraffic = (href: string, referrer: string) => {
  let utmSource = '';
  let utmMedium = '';
  let utmCampaign = '';
  let gclid = '';
  let referrerHost = '';
  try {
    const url = new URL(href);
    utmSource = url.searchParams.get('utm_source') || '';
    utmMedium = url.searchParams.get('utm_medium') || '';
    utmCampaign = url.searchParams.get('utm_campaign') || '';
    gclid = url.searchParams.get('gclid') || '';
  } catch {
    // ignore
  }
  try {
    if (referrer) referrerHost = new URL(referrer).host;
  } catch {
    referrerHost = '';
  }
  return { utmSource, utmMedium, utmCampaign, gclid, referrerHost };
};

export const currentScrollPercent = (): number => {
  if (typeof window === 'undefined') return 0;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((window.scrollY / max) * 100)));
};

export const nextScrollBucket = (
  previousMax: number,
  current: number,
): 25 | 50 | 75 | 100 | null => {
  for (const bucket of [25, 50, 75, 100] as const) {
    if (current >= bucket && previousMax < bucket) return bucket;
  }
  return null;
};
