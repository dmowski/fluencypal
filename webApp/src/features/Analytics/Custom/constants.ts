export const ANALYTICS_MESSAGE_SOURCE = 'fp-custom-analytics';
export const ANALYTICS_VISITOR_STORAGE_KEY = 'fp_custom_analytics_visitor_id';
export const ANALYTICS_TRACKER_PATH = '/analytics/tracker';
export const PRODUCTION_APP_ORIGIN = 'https://app.fluencypal.com';
export const LOCAL_APP_ORIGIN = 'http://localhost:3000';

export const VISITORS_COLLECTION = 'customAnalyticsVisitors';
export const EVENTS_COLLECTION = 'customAnalyticsEvents';

export const MAX_EVENT_STRING = {
  path: 500,
  href: 1000,
  title: 200,
  referrer: 500,
  language: 32,
  authUserId: 128,
  buttonId: 120,
  buttonText: 80,
  buttonHref: 500,
  tagName: 32,
  visitorId: 64,
} as const;
