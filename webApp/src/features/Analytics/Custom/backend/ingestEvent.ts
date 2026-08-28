import { FieldValue } from 'firebase-admin/firestore';
import { getDB } from '@/app/api/config/firebase';
import { parseBrowserInfo } from '@/features/Analytics/AdminStats/parseBrowserInfo';
import { classifyFunnelFlags, mergeFunnelFlags } from '../classifyFunnel';
import { AnalyticsClientEvent, AnalyticsEventDoc, AnalyticsVisitorDoc } from '../types';
import { eventsCollectionName, visitorsCollectionName } from './collections';
import { isValidVisitorId } from '../visitorId';

const HOUR_MS = 60 * 60 * 1000;
const MAX_EVENTS_PER_HOUR = 180;
const MAX_IP_HITS_PER_10S = 40;

type RateWindow = { count: number; windowStart: number };

const visitorHourHits = new Map<string, RateWindow>();
const ipHits = new Map<string, RateWindow>();

const hostFromHref = (href: string): string => {
  try {
    return new URL(href).host;
  } catch {
    return '';
  }
};

export const utcDayKey = (date = new Date()): string => {
  return date.toISOString().slice(0, 10);
};

const bumpWindow = (store: Map<string, RateWindow>, key: string, windowMs: number): number => {
  const now = Date.now();
  const current = store.get(key);
  if (!current || now - current.windowStart >= windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return 1;
  }
  current.count += 1;
  return current.count;
};

export const isRateLimited = (visitorId: string, ip: string): boolean => {
  if (bumpWindow(visitorHourHits, visitorId, HOUR_MS) > MAX_EVENTS_PER_HOUR) return true;
  if (ip && bumpWindow(ipHits, ip, 10_000) > MAX_IP_HITS_PER_10S) return true;
  return false;
};

export const clientIpFromHeaders = (request: Request): string => {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || '';
  }
  return request.headers.get('x-real-ip') || '';
};

export const ingestAnalyticsEvent = async (input: {
  visitorId: string;
  event: AnalyticsClientEvent;
  userAgent: string;
}): Promise<void> => {
  if (!isValidVisitorId(input.visitorId)) {
    throw new Error('Invalid visitor id');
  }

  const now = new Date();
  const createdAtIso = now.toISOString();
  const createdAtMs = now.getTime();
  const { browserName, os } = parseBrowserInfo(input.userAgent);
  const host = hostFromHref(input.event.href);
  const flags = classifyFunnelFlags(input.event);
  const eventId = `${input.visitorId}_${createdAtMs}_${Math.random().toString(36).slice(2, 8)}`;

  const eventDoc: AnalyticsEventDoc = {
    visitorId: input.visitorId,
    authUserId: input.event.authUserId || null,
    name: input.event.name,
    sourceApp: input.event.sourceApp,
    path: input.event.path,
    href: input.event.href,
    title: input.event.title,
    referrer: input.event.referrer,
    host,
    createdAtIso,
    createdAtMs,
    dayKey: utcDayKey(now),
    userAgent: input.userAgent.slice(0, 500),
    os,
    browser: browserName,
    screenWidth: input.event.screen.width,
    screenHeight: input.event.screen.height,
    language: input.event.language,
    buttonId: input.event.buttonId || null,
    buttonText: input.event.buttonText || null,
    buttonHref: input.event.buttonHref || null,
    tagName: input.event.tagName || null,
  };

  const db = getDB();
  const visitorRef = db.collection(visitorsCollectionName).doc(input.visitorId);
  const eventRef = db.collection(eventsCollectionName).doc(eventId);
  const existing = await visitorRef.get();

  const batch = db.batch();
  batch.set(eventRef, eventDoc);

  if (!existing.exists) {
    const visitor: AnalyticsVisitorDoc = {
      visitorId: input.visitorId,
      createdAtIso,
      lastSeenAtIso: createdAtIso,
      firstPath: input.event.path,
      lastPath: input.event.path,
      lastEventName: input.event.name,
      lastHost: host,
      firstHost: host,
      firstSourceApp: input.event.sourceApp,
      lastSourceApp: input.event.sourceApp,
      eventCount: 1,
      userAgent: eventDoc.userAgent,
      os,
      browser: browserName,
      screenWidth: input.event.screen.width,
      screenHeight: input.event.screen.height,
      language: input.event.language,
      authUserId: input.event.authUserId || null,
      lastReferrer: input.event.referrer,
      ...flags,
    };
    batch.set(visitorRef, visitor);
  } else {
    const previous = existing.data() as AnalyticsVisitorDoc;
    const merged = mergeFunnelFlags(previous, flags);
    batch.update(visitorRef, {
      lastSeenAtIso: createdAtIso,
      lastPath: input.event.path,
      lastEventName: input.event.name,
      lastHost: host,
      lastSourceApp: input.event.sourceApp,
      eventCount: FieldValue.increment(1),
      userAgent: eventDoc.userAgent,
      os,
      browser: browserName,
      screenWidth: input.event.screen.width,
      screenHeight: input.event.screen.height,
      language: input.event.language,
      authUserId: input.event.authUserId || previous.authUserId || null,
      lastReferrer: input.event.referrer,
      ...merged,
    });
  }

  await batch.commit();
};
