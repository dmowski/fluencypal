import { ANALYTICS_MESSAGE_SOURCE, PRODUCTION_APP_ORIGIN } from './constants';
import { buildEventMessage, getTrackerOrigin } from './protocol';
import { AnalyticsClientEvent, AnalyticsSourceApp } from './types';
import { validateClientEvent } from './validateEvent';
import { classifyCta } from './classifyCta';
import { parseTraffic } from './parseTraffic';
import { isBotBrowser } from './isBotUserAgent';

type QueuedMessage = ReturnType<typeof buildEventMessage>;

let iframeWindow: Window | null = null;
let trackerOrigin = PRODUCTION_APP_ORIGIN;
let isReady = false;
let authUserId = '';
let visitorId = '';
let sourceApp: AnalyticsSourceApp = 'webapp';
const queue: QueuedMessage[] = [];

export const setAnalyticsAuthUserId = (uid: string): void => {
  authUserId = uid;
};

export const getAnalyticsAuthUserId = (): string => authUserId;

export const setAnalyticsSourceApp = (app: AnalyticsSourceApp): void => {
  sourceApp = app;
};

export const setAnalyticsVisitorId = (id: string): void => {
  visitorId = id;
};

export const getAnalyticsVisitorId = (): string => visitorId;

export const attachAnalyticsIframe = (contentWindow: Window | null): void => {
  iframeWindow = contentWindow;
  trackerOrigin = getTrackerOrigin();
};

export const markAnalyticsIframeReady = (): void => {
  isReady = true;
  flushAnalyticsQueue();
};

export const resetAnalyticsBridgeForTests = (): void => {
  iframeWindow = null;
  isReady = false;
  authUserId = '';
  visitorId = '';
  sourceApp = 'webapp';
  queue.length = 0;
};

const postToIframe = (message: QueuedMessage): void => {
  if (!iframeWindow || !isReady) {
    queue.push(message);
    return;
  }
  iframeWindow.postMessage(message, trackerOrigin);
};

const flushAnalyticsQueue = (): void => {
  if (!iframeWindow || !isReady) return;
  while (queue.length > 0) {
    const next = queue.shift();
    if (next) {
      iframeWindow.postMessage(next, trackerOrigin);
    }
  }
};

export const sendAnalyticsEvent = (
  partial: Partial<AnalyticsClientEvent> & Pick<AnalyticsClientEvent, 'name'>,
): void => {
  if (typeof window === 'undefined') return;
  if (isBotBrowser()) return;

  const href = partial.href || window.location.href;
  const referrer = partial.referrer ?? document.referrer;
  const traffic = parseTraffic(href, referrer);
  const cta =
    partial.name === 'click'
      ? classifyCta({
          href: partial.buttonHref || '',
          buttonId: partial.buttonId,
        })
      : null;

  const event = validateClientEvent({
    name: partial.name,
    sourceApp: partial.sourceApp || sourceApp,
    path: partial.path || `${window.location.pathname}${window.location.search}`,
    href,
    title: partial.title || document.title,
    referrer,
    language: partial.language || navigator.language,
    screen: partial.screen || {
      width: window.screen.width,
      height: window.screen.height,
    },
    authUserId: partial.authUserId || authUserId || undefined,
    buttonId: partial.buttonId,
    buttonText: partial.buttonText,
    buttonHref: partial.buttonHref,
    tagName: partial.tagName,
    ctaId: partial.ctaId || cta?.ctaId,
    ctaIntent: partial.ctaIntent || cta?.ctaIntent,
    scrollPct: partial.scrollPct,
    durationMs: partial.durationMs,
    maxScrollPct: partial.maxScrollPct,
    utmSource: partial.utmSource || traffic.utmSource,
    utmMedium: partial.utmMedium || traffic.utmMedium,
    utmCampaign: partial.utmCampaign || traffic.utmCampaign,
    gclid: partial.gclid || traffic.gclid,
    referrerHost: partial.referrerHost || traffic.referrerHost,
    conversationId: partial.conversationId,
    speechSurface: partial.speechSurface,
  });

  if (!event) return;
  postToIframe(buildEventMessage(event, visitorId || undefined));
};

export const isCustomAnalyticsReadyMessage = (data: unknown): boolean => {
  if (!data || typeof data !== 'object') return false;
  const record = data as { source?: unknown; type?: unknown };
  return record.source === ANALYTICS_MESSAGE_SOURCE && record.type === 'ready';
};
