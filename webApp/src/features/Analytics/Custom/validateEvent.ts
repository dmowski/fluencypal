import { CTA_INTENTS, CtaIntent } from './classifyCta';
import { MAX_EVENT_STRING } from './constants';
import {
  ANALYTICS_EVENT_NAMES,
  ANALYTICS_SOURCE_APPS,
  AnalyticsClientEvent,
  AnalyticsEventName,
  AnalyticsScreen,
  AnalyticsSourceApp,
} from './types';
import { isValidVisitorId } from './visitorId';

const EVENT_NAME_SET = new Set<string>(ANALYTICS_EVENT_NAMES);
const SOURCE_APP_SET = new Set<string>(ANALYTICS_SOURCE_APPS);
const CTA_INTENT_SET = new Set<string>(CTA_INTENTS);

const clip = (value: unknown, max: number): string => {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
};

const toScreen = (value: unknown): AnalyticsScreen => {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const width =
    typeof record.width === 'number' && Number.isFinite(record.width) ? record.width : 0;
  const height =
    typeof record.height === 'number' && Number.isFinite(record.height) ? record.height : 0;
  return {
    width: Math.max(0, Math.min(Math.round(width), 16000)),
    height: Math.max(0, Math.min(Math.round(height), 16000)),
  };
};

const toPct = (value: unknown): number | undefined => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.min(100, Math.round(value)));
};

const toDuration = (value: unknown): number | undefined => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.min(86_400_000, Math.round(value)));
};

export const validateVisitorId = (visitorId: unknown): string | null => {
  if (typeof visitorId !== 'string') return null;
  const clipped = visitorId.trim().slice(0, MAX_EVENT_STRING.visitorId);
  return isValidVisitorId(clipped) ? clipped : null;
};

export const validateClientEvent = (input: unknown): AnalyticsClientEvent | null => {
  if (!input || typeof input !== 'object') return null;
  const record = input as Record<string, unknown>;

  const name = typeof record.name === 'string' ? record.name : '';
  if (!EVENT_NAME_SET.has(name)) return null;

  const sourceApp = typeof record.sourceApp === 'string' ? record.sourceApp : '';
  if (!SOURCE_APP_SET.has(sourceApp)) return null;

  const path = clip(record.path, MAX_EVENT_STRING.path);
  if (!path) return null;

  const event: AnalyticsClientEvent = {
    name: name as AnalyticsEventName,
    sourceApp: sourceApp as AnalyticsSourceApp,
    path,
    href: clip(record.href, MAX_EVENT_STRING.href),
    title: clip(record.title, MAX_EVENT_STRING.title),
    referrer: clip(record.referrer, MAX_EVENT_STRING.referrer),
    language: clip(record.language, MAX_EVENT_STRING.language),
    screen: toScreen(record.screen),
  };

  const authUserId = clip(record.authUserId, MAX_EVENT_STRING.authUserId);
  if (authUserId) event.authUserId = authUserId;

  const buttonId = clip(record.buttonId, MAX_EVENT_STRING.buttonId);
  if (buttonId) event.buttonId = buttonId;

  const buttonText = clip(record.buttonText, MAX_EVENT_STRING.buttonText);
  if (buttonText) event.buttonText = buttonText;

  const buttonHref = clip(record.buttonHref, MAX_EVENT_STRING.buttonHref);
  if (buttonHref) event.buttonHref = buttonHref;

  const tagName = clip(record.tagName, MAX_EVENT_STRING.tagName).toLowerCase();
  if (tagName) event.tagName = tagName;

  const ctaId = clip(record.ctaId, MAX_EVENT_STRING.ctaId);
  if (ctaId) event.ctaId = ctaId;

  const ctaIntent = clip(record.ctaIntent, MAX_EVENT_STRING.ctaIntent);
  if (CTA_INTENT_SET.has(ctaIntent)) event.ctaIntent = ctaIntent as CtaIntent;

  const scrollPct = toPct(record.scrollPct);
  if (scrollPct !== undefined) event.scrollPct = scrollPct;

  const durationMs = toDuration(record.durationMs);
  if (durationMs !== undefined) event.durationMs = durationMs;

  const maxScrollPct = toPct(record.maxScrollPct);
  if (maxScrollPct !== undefined) event.maxScrollPct = maxScrollPct;

  const utmSource = clip(record.utmSource, MAX_EVENT_STRING.utm);
  if (utmSource) event.utmSource = utmSource;
  const utmMedium = clip(record.utmMedium, MAX_EVENT_STRING.utm);
  if (utmMedium) event.utmMedium = utmMedium;
  const utmCampaign = clip(record.utmCampaign, MAX_EVENT_STRING.utm);
  if (utmCampaign) event.utmCampaign = utmCampaign;
  const gclid = clip(record.gclid, MAX_EVENT_STRING.utm);
  if (gclid) event.gclid = gclid;
  const referrerHost = clip(record.referrerHost, MAX_EVENT_STRING.referrerHost);
  if (referrerHost) event.referrerHost = referrerHost;
  const conversationId = clip(record.conversationId, MAX_EVENT_STRING.conversationId);
  if (conversationId) event.conversationId = conversationId;

  return event;
};
