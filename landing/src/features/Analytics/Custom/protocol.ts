export const ANALYTICS_MESSAGE_SOURCE = 'fp-custom-analytics';
export const ANALYTICS_TRACKER_PATH = '/analytics/tracker';
export const PRODUCTION_APP_ORIGIN = 'https://app.fluencypal.com';
export const LOCAL_APP_ORIGIN = 'http://localhost:3000';

export type LandingAnalyticsEventName = 'page_view' | 'click';

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
};

export type LandingParentToIframeMessage =
  | {
      source: typeof ANALYTICS_MESSAGE_SOURCE;
      type: 'event';
      event: LandingAnalyticsEvent;
    }
  | {
      source: typeof ANALYTICS_MESSAGE_SOURCE;
      type: 'hello';
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

export const buildEventMessage = (event: LandingAnalyticsEvent): LandingParentToIframeMessage => {
  return {
    source: ANALYTICS_MESSAGE_SOURCE,
    type: 'event',
    event,
  };
};

export const buildHelloMessage = (): LandingParentToIframeMessage => {
  return {
    source: ANALYTICS_MESSAGE_SOURCE,
    type: 'hello',
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
