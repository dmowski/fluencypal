#!/usr/bin/env node
/**
 * Export custom analytics for a UTC day using Admin SDK credentials
 * from webApp/.env. Writes gitignored JSON for agent analysis.
 *
 * Usage (from webApp/):
 *   pnpm analytics:export
 *   pnpm analytics:export -- --day 2026-08-28
 */
import fs from 'node:fs';
import path from 'node:path';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { PROJECT_ID, readServiceAccount, webAppRoot } from './firebaseEnv.mjs';

const VISITORS = 'customAnalyticsVisitors';
const EVENTS = 'customAnalyticsEvents';
const MAX_VISITORS = 400;
const MAX_EVENTS_PER_VISITOR = 300;
const OUTPUT = path.join(webAppRoot, '.analytics-export.json');
const KEEP_QUERY = new Set(['currentStep', 'rolePlayId', 'interactiveLesson', 'dailyQuestions']);

const argValue = (flag) => {
  const args = process.argv.slice(2);
  const eq = args.find((arg) => arg.startsWith(`${flag}=`));
  if (eq) return eq.slice(flag.length + 1);
  const index = args.indexOf(flag);
  if (index >= 0) return args[index + 1];
  return null;
};

const dayKey = argValue('--day') || new Date().toISOString().slice(0, 10);

const start = new Date(`${dayKey}T00:00:00.000Z`);
const end = new Date(`${dayKey}T23:59:59.999Z`);
if (Number.isNaN(start.getTime())) {
  throw new Error(`Invalid --day ${dayKey}. Use YYYY-MM-DD.`);
}

const fromIso = start.toISOString();
const toIso = end.toISOString();

const normalizePath = (rawPath) => {
  const raw = String(rawPath || '').trim() || '/';
  try {
    const url = new URL(raw, 'https://app.fluencypal.com');
    const kept = new URLSearchParams();
    for (const key of KEEP_QUERY) {
      const value = url.searchParams.get(key);
      if (value) kept.set(key, value);
    }
    const search = kept.toString();
    const pathname = url.pathname || '/';
    return search ? `${pathname}?${search}` : pathname;
  } catch {
    return raw.split('?')[0] || '/';
  }
};

const isInternalHost = (host) =>
  Boolean(host && (String(host).includes('localhost') || String(host).includes('127.0.0.1')));

const isInternalPath = (value) => {
  if (!value) return false;
  return value === '/testUi' || String(value).startsWith('/testUi/') || String(value).startsWith('/testUi?');
};

const isInternalVisitor = (visitor, events) => {
  if (
    [visitor.referrerHost, visitor.firstHost, visitor.lastHost].some((host) => isInternalHost(host))
  ) {
    return true;
  }
  return [visitor.firstPath, visitor.lastPath, ...events.map((event) => event.path)].some(
    (eventPath) => isInternalPath(eventPath),
  );
};

const pathLooksLikeQuiz = (eventPath) => /(^|\/)quiz(\/|$|\?)/i.test(eventPath || '');
const pathLooksLikePractice = (eventPath) => /(^|\/)practice(\/|$|\?)/i.test(eventPath || '');

const flagsFromEvents = (events) => {
  const flags = {
    landing: false,
    app: false,
    auth: false,
    quiz: false,
    practice: false,
    conversation: false,
    paywall: false,
    checkout: false,
    clickedQuizCta: false,
    clickedSignInCta: false,
  };
  for (const event of events) {
    if (event.sourceApp === 'landing') flags.landing = true;
    if (event.sourceApp === 'webapp') flags.app = true;
    if (event.name === 'identify' || event.authUserId) flags.auth = true;
    if (pathLooksLikeQuiz(event.path)) flags.quiz = true;
    if (pathLooksLikePractice(event.path)) flags.practice = true;
    if (event.name === 'conversation_start') flags.conversation = true;
    if (event.name === 'paywall_view' || event.name === 'checkout_start') flags.paywall = true;
    if (event.name === 'checkout_start') flags.checkout = true;
    if (event.sourceApp === 'landing' && event.ctaIntent === 'quiz') flags.clickedQuizCta = true;
    if (event.sourceApp === 'landing' && event.ctaIntent === 'signin') flags.clickedSignInCta = true;
  }
  return flags;
};

const emptyFunnel = () => ({
  landing: 0,
  app: 0,
  auth: 0,
  quiz: 0,
  practice: 0,
  conversation: 0,
  paywall: 0,
  checkout: 0,
});

const addFlagsToFunnel = (funnel, flags) => {
  if (flags.landing) funnel.landing += 1;
  if (flags.app) funnel.app += 1;
  if (flags.auth) funnel.auth += 1;
  if (flags.quiz) funnel.quiz += 1;
  if (flags.practice) funnel.practice += 1;
  if (flags.conversation) funnel.conversation += 1;
  if (flags.paywall) funnel.paywall += 1;
  if (flags.checkout) funnel.checkout += 1;
};

const argValue = (flag) => {
  const args = process.argv.slice(2);
  const eq = args.find((arg) => arg.startsWith(`${flag}=`));
  if (eq) return eq.slice(flag.length + 1);
  const index = args.indexOf(flag);
  if (index >= 0) return args[index + 1];
  return null;
};

const dayKey = argValue('--day') || new Date().toISOString().slice(0, 10);

const start = new Date(`${dayKey}T00:00:00.000Z`);
const end = new Date(`${dayKey}T23:59:59.999Z`);
if (Number.isNaN(start.getTime())) {
  throw new Error(`Invalid --day ${dayKey}. Use YYYY-MM-DD.`);
}

const fromIso = start.toISOString();
const toIso = end.toISOString();

const serviceAccount = readServiceAccount();
const app = initializeApp(
  {
    credential: cert({
      projectId: serviceAccount.project_id || PROJECT_ID,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    }),
  },
  `analytics-export-${Date.now()}`,
);
const db = getFirestore(app);

const visitorsSnap = await db
  .collection(VISITORS)
  .where('lastSeenAtIso', '>=', fromIso)
  .where('lastSeenAtIso', '<=', toIso)
  .orderBy('lastSeenAtIso', 'desc')
  .limit(MAX_VISITORS)
  .get();

// Keep in sync with isReportableVisitor.ts
const isReportableVisitor = (visitor) =>
  !(visitor.eventCount <= 1 && visitor.lastEventName === 'page_view');

const rawVisitors = visitorsSnap.docs.map((doc) => doc.data());
const skippedUnengaged = rawVisitors.filter((visitor) => !isReportableVisitor(visitor)).length;

const allEventsByVisitorId = {};
for (const visitor of rawVisitors.filter(isReportableVisitor)) {
  const eventsSnap = await db
    .collection(EVENTS)
    .where('visitorId', '==', visitor.visitorId)
    .limit(MAX_EVENTS_PER_VISITOR)
    .get();
  allEventsByVisitorId[visitor.visitorId] = eventsSnap.docs
    .map((doc) => doc.data())
    .sort((a, b) => (a.createdAtMs || 0) - (b.createdAtMs || 0));
}

const todayOf = (events) => events.filter((event) => event.dayKey === dayKey);

let skippedInternal = 0;
let skippedNoTodayEvents = 0;
const visitors = [];
const eventsByVisitorId = {};
for (const visitor of rawVisitors.filter(isReportableVisitor)) {
  const allEvents = allEventsByVisitorId[visitor.visitorId] || [];
  if (isInternalVisitor(visitor, allEvents)) {
    skippedInternal += 1;
    continue;
  }
  const todayEvents = todayOf(allEvents);
  if (todayEvents.length === 0) {
    skippedNoTodayEvents += 1;
    continue;
  }
  visitors.push(visitor);
  eventsByVisitorId[visitor.visitorId] = todayEvents;
}

const countBy = (values) => {
  const map = new Map();
  for (const value of values) {
    map.set(value, (map.get(value) || 0) + 1);
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
};

const funnel = emptyFunnel();
const funnelNew = emptyFunnel();
const ctaClicks = { quiz: 0, signin: 0, practice: 0, pricing: 0, other: 0 };
const scrollBuckets = { 25: 0, 50: 0, 75: 0, 100: 0 };
let landingDurationSum = 0;
let landingDurationCount = 0;
let landingVisitorCount = 0;
const countries = [];
const languages = [];
const referrers = [];
const utmSources = [];
const firstPaths = [];
const lastPaths = [];
const quizCtaIds = [];
const signInCtaIds = [];
const conversationStartPaths = [];
const pathBeforeSpeak = [];
const durationMaxByVisitorPath = new Map();
let paywallViews = 0;
let checkoutStarts = 0;
let newVisitorCount = 0;

for (const visitor of visitors) {
  const events = eventsByVisitorId[visitor.visitorId] || [];
  const flags = flagsFromEvents(events);
  const isNew = String(visitor.createdAtIso || '').startsWith(dayKey);
  if (isNew) newVisitorCount += 1;
  addFlagsToFunnel(funnel, flags);
  if (isNew) addFlagsToFunnel(funnelNew, flags);

  let landingMaxScroll = 0;
  let landingMaxDuration = 0;
  for (const event of events) {
    if (event.sourceApp !== 'landing') continue;
    landingMaxScroll = Math.max(
      landingMaxScroll,
      event.maxScrollPct || 0,
      event.scrollPct || 0,
    );
    if (event.name === 'page_leave' && event.durationMs > 0) {
      landingMaxDuration = Math.max(landingMaxDuration, event.durationMs);
    }
  }
  if (landingMaxScroll >= 25) scrollBuckets[25] += 1;
  if (landingMaxScroll >= 50) scrollBuckets[50] += 1;
  if (landingMaxScroll >= 75) scrollBuckets[75] += 1;
  if (landingMaxScroll >= 100) scrollBuckets[100] += 1;
  if (landingMaxDuration > 0) {
    landingDurationSum += landingMaxDuration;
    landingDurationCount += 1;
  }
  if (events.some((event) => event.sourceApp === 'landing')) landingVisitorCount += 1;

  if (visitor.country) countries.push(visitor.country);
  if (visitor.language) languages.push(visitor.language);
  if (visitor.referrerHost) referrers.push(visitor.referrerHost);
  if (visitor.utmSource) utmSources.push(visitor.utmSource);
  firstPaths.push(normalizePath(events[0]?.path || visitor.firstPath || '(unknown)'));
  lastPaths.push(normalizePath(events[events.length - 1]?.path || visitor.lastPath || '(unknown)'));
}

for (const events of Object.values(eventsByVisitorId)) {
  let lastPagePath = '';
  let recordedSpeak = false;
  const maxDuration = new Map();
  for (const event of events) {
    const eventPath = normalizePath(event.path || '');
    if (event.name === 'page_view') lastPagePath = eventPath;
    if (event.name === 'page_leave' && event.durationMs > 0 && eventPath) {
      maxDuration.set(eventPath, Math.max(maxDuration.get(eventPath) || 0, event.durationMs));
    }
    if (event.name === 'paywall_view') paywallViews += 1;
    if (event.name === 'checkout_start') checkoutStarts += 1;
    if (event.name === 'click' && event.sourceApp === 'landing' && event.ctaIntent) {
      if (ctaClicks[event.ctaIntent] !== undefined) ctaClicks[event.ctaIntent] += 1;
      if (event.ctaIntent === 'quiz') quizCtaIds.push(event.ctaId || 'quiz');
      if (event.ctaIntent === 'signin') signInCtaIds.push(event.ctaId || 'signin');
    }
    if (event.name === 'conversation_start' && !recordedSpeak) {
      recordedSpeak = true;
      conversationStartPaths.push(eventPath || '(unknown)');
      pathBeforeSpeak.push(lastPagePath || eventPath || '(unknown)');
    }
  }
  for (const [eventPath, durationMs] of maxDuration) {
    const current = durationMaxByVisitorPath.get(eventPath) || { sum: 0, count: 0 };
    current.sum += durationMs;
    current.count += 1;
    durationMaxByVisitorPath.set(eventPath, current);
  }
}

const todayEventCount = visitors.reduce(
  (sum, visitor) => sum + (eventsByVisitorId[visitor.visitorId] || []).length,
  0,
);

const payload = {
  exportedAtIso: new Date().toISOString(),
  dayKey,
  fromIso,
  toIso,
  timezone: 'UTC',
  visitorCount: visitors.length,
  visitorCountNew: newVisitorCount,
  visitorCountReturning: visitors.length - newVisitorCount,
  eventCount: todayEventCount,
  funnel,
  funnelNew,
  insights: {
    avgLandingDurationMs: landingDurationCount
      ? Math.round(landingDurationSum / landingDurationCount)
      : 0,
    landingVisitorCount,
    scrollBuckets,
    ctaClicks,
    quizCtaIds: countBy(quizCtaIds),
    signInCtaIds: countBy(signInCtaIds),
    countries: countBy(countries),
    languages: countBy(languages),
    referrers: countBy(referrers),
    utmSources: countBy(utmSources),
    firstPaths: countBy(firstPaths),
    paywallViews,
    checkoutStarts,
    conversationStartPaths: countBy(conversationStartPaths),
    pathBeforeSpeak: countBy(pathBeforeSpeak),
    durationByPath: [...durationMaxByVisitorPath.entries()]
      .map(([eventPath, value]) => ({
        path: eventPath,
        count: value.count,
        avgMs: Math.round(value.sum / value.count),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
  },
  dropOff: countBy(lastPaths).map((row) => ({
    path: row.key,
    count: row.count,
  })),
  os: countBy(visitors.map((visitor) => visitor.os || 'Unknown OS')).map((row) => ({
    os: row.key,
    count: row.count,
  })),
  visitors,
  eventsByVisitorId,
};

fs.writeFileSync(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`);
const skippedParts = [];
if (skippedUnengaged) skippedParts.push(`${skippedUnengaged} unengaged page_view-only`);
if (skippedInternal) skippedParts.push(`${skippedInternal} internal`);
if (skippedNoTodayEvents) skippedParts.push(`${skippedNoTodayEvents} no events on this UTC day`);
console.log(
  `Wrote ${visitors.length} visitors (${newVisitorCount} new) for ${dayKey} UTC to ${path.relative(webAppRoot, OUTPUT)}` +
    (skippedParts.length ? ` (${skippedParts.join(', ')} dropped)` : ''),
);
