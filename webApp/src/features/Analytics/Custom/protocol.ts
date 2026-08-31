import {
  ANALYTICS_MESSAGE_SOURCE,
  ANALYTICS_TRACKER_PATH,
  LOCAL_APP_ORIGIN,
  PRODUCTION_APP_ORIGIN,
} from './constants';
import { AnalyticsClientEvent } from './types';

export type AnalyticsParentToIframeMessage =
  | {
      source: typeof ANALYTICS_MESSAGE_SOURCE;
      type: 'event';
      event: AnalyticsClientEvent;
      visitorId?: string;
    }
  | {
      source: typeof ANALYTICS_MESSAGE_SOURCE;
      type: 'hello';
      visitorId?: string;
    };

export type AnalyticsIframeToParentMessage = {
  source: typeof ANALYTICS_MESSAGE_SOURCE;
  type: 'ready';
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

export const isAnalyticsMessage = (
  data: unknown,
): data is AnalyticsParentToIframeMessage | AnalyticsIframeToParentMessage => {
  if (!data || typeof data !== 'object') return false;
  const record = data as { source?: unknown; type?: unknown };
  return record.source === ANALYTICS_MESSAGE_SOURCE && typeof record.type === 'string';
};

export const buildEventMessage = (
  event: AnalyticsClientEvent,
  visitorId?: string,
): AnalyticsParentToIframeMessage => {
  return {
    source: ANALYTICS_MESSAGE_SOURCE,
    type: 'event',
    event,
    ...(visitorId ? { visitorId } : {}),
  };
};

export const buildHelloMessage = (visitorId?: string): AnalyticsParentToIframeMessage => {
  return {
    source: ANALYTICS_MESSAGE_SOURCE,
    type: 'hello',
    ...(visitorId ? { visitorId } : {}),
  };
};

export const buildReadyMessage = (): AnalyticsIframeToParentMessage => {
  return {
    source: ANALYTICS_MESSAGE_SOURCE,
    type: 'ready',
  };
};
