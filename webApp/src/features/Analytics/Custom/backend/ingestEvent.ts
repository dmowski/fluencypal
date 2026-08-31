import { FieldValue } from 'firebase-admin/firestore';
import { getDB } from '@/app/api/config/firebase';
import { parseBrowserInfo } from '@/features/Analytics/AdminStats/parseBrowserInfo';
import { ANALYTICS_VISITOR_QUERY } from '../constants';
import { normalizeAnalyticsPath, stripVisitorIdFromHref } from '../analyticsPath';
import { classifyFunnelFlags, mergeFunnelFlags, visitorFunnelFlags } from '../classifyFunnel';
import { shouldPersistAnalyticsEvent } from '../isReportableVisitor';
import { AnalyticsClientEvent, AnalyticsEventDoc, AnalyticsVisitorDoc } from '../types';
import { isValidVisitorId } from '../visitorId';
import { eventsCollectionName, visitorsCollectionName } from './collections';

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
  country: string;
}): Promise<void> => {
  if (!isValidVisitorId(input.visitorId)) {
    throw new Error('Invalid visitor id');
  }

  const now = new Date();
  const createdAtIso = now.toISOString();
  const createdAtMs = now.getTime();
  const { browserName, os } = parseBrowserInfo(input.userAgent);
  const path = normalizeAnalyticsPath(input.event.path);
  const href = stripVisitorIdFromHref(input.event.href, ANALYTICS_VISITOR_QUERY);
  const host = hostFromHref(href);
  const flags = classifyFunnelFlags({ ...input.event, path });
  const eventId = `${input.visitorId}_${createdAtMs}_${Math.random().toString(36).slice(2, 8)}`;
  const country = input.country || null;

  const eventDoc: AnalyticsEventDoc = {
    visitorId: input.visitorId,
    authUserId: input.event.authUserId || null,
    name: input.event.name,
    sourceApp: input.event.sourceApp,
    path,
    href,
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
    ctaId: input.event.ctaId || null,
    ctaIntent: input.event.ctaIntent || null,
    scrollPct: input.event.scrollPct ?? null,
    durationMs: input.event.durationMs ?? null,
    maxScrollPct: input.event.maxScrollPct ?? null,
    utmSource: input.event.utmSource || null,
    utmMedium: input.event.utmMedium || null,
    utmCampaign: input.event.utmCampaign || null,
    gclid: input.event.gclid || null,
    referrerHost: input.event.referrerHost || null,
    country,
    conversationId: input.event.conversationId || null,
    speechSurface: input.event.speechSurface || null,
  };

  const db = getDB();
  const visitorRef = db.collection(visitorsCollectionName).doc(input.visitorId);
  const existing = await visitorRef.get();
  if (!shouldPersistAnalyticsEvent(input.event.name, existing.exists)) {
    return;
  }

  const eventRef = db.collection(eventsCollectionName).doc(eventId);
  const batch = db.batch();
  batch.set(eventRef, eventDoc);

  const landingDurationMs =
    input.event.sourceApp === 'landing' && input.event.name === 'page_leave'
      ? input.event.durationMs || 0
      : 0;
  const maxScrollPct = Math.max(input.event.maxScrollPct || 0, input.event.scrollPct || 0);

  if (!existing.exists) {
    const visitor: AnalyticsVisitorDoc = {
      visitorId: input.visitorId,
      createdAtIso,
      lastSeenAtIso: createdAtIso,
      firstPath: path,
      lastPath: path,
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
      maxScrollPct,
      landingDurationMs,
      country,
      utmSource: input.event.utmSource || null,
      utmMedium: input.event.utmMedium || null,
      utmCampaign: input.event.utmCampaign || null,
      referrerHost: input.event.referrerHost || null,
      ...flags,
    };
    batch.set(visitorRef, visitor);
  } else {
    const previous = existing.data() as AnalyticsVisitorDoc;
    const merged = mergeFunnelFlags(visitorFunnelFlags(previous), flags);
    batch.update(visitorRef, {
      lastSeenAtIso: createdAtIso,
      lastPath: path,
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
      maxScrollPct: Math.max(previous.maxScrollPct || 0, maxScrollPct),
      landingDurationMs: (previous.landingDurationMs || 0) + landingDurationMs,
      country: previous.country || country,
      utmSource: previous.utmSource || input.event.utmSource || null,
      utmMedium: previous.utmMedium || input.event.utmMedium || null,
      utmCampaign: previous.utmCampaign || input.event.utmCampaign || null,
      referrerHost: previous.referrerHost || input.event.referrerHost || null,
      ...merged,
    });
  }

  await batch.commit();
};
