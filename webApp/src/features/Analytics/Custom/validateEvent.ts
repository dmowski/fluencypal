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

  return event;
};
