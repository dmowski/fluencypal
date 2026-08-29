#!/usr/bin/env node
/**
 * Export custom analytics for a local day range using Admin SDK credentials
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

const argValue = (flag) => {
  const args = process.argv.slice(2);
  const eq = args.find((arg) => arg.startsWith(`${flag}=`));
  if (eq) return eq.slice(flag.length + 1);
  const index = args.indexOf(flag);
  if (index >= 0) return args[index + 1];
  return null;
};

const dayKey = argValue('--day') || new Date().toISOString().slice(0, 10);

const start = new Date(`${dayKey}T00:00:00`);
const end = new Date(`${dayKey}T23:59:59.999`);
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
const skippedCount = rawVisitors.length - rawVisitors.filter(isReportableVisitor).length;
const visitors = rawVisitors.filter(isReportableVisitor);

const eventsByVisitorId = {};
for (const visitor of visitors) {
  const eventsSnap = await db
    .collection(EVENTS)
    .where('visitorId', '==', visitor.visitorId)
    .limit(MAX_EVENTS_PER_VISITOR)
    .get();
  eventsByVisitorId[visitor.visitorId] = eventsSnap.docs
    .map((doc) => doc.data())
    .sort((a, b) => (a.createdAtMs || 0) - (b.createdAtMs || 0));
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

const funnel = {
  landing: 0,
  app: 0,
  auth: 0,
  quiz: 0,
  practice: 0,
  conversation: 0,
  paywall: 0,
  checkout: 0,
};
const ctaClicks = { quiz: 0, signin: 0, practice: 0, pricing: 0, other: 0 };
const scrollBuckets = { 25: 0, 50: 0, 75: 0, 100: 0 };
let landingDurationSum = 0;
let landingDurationCount = 0;
const countries = [];
const languages = [];
const referrers = [];
const utmSources = [];
const firstPaths = [];
const quizCtaIds = [];
const signInCtaIds = [];
const conversationStartPaths = [];
const pathBeforeSpeak = [];
const durationByPath = new Map();
let paywallViews = 0;
let checkoutStarts = 0;

for (const visitor of visitors) {
  if (visitor.reachedLanding) funnel.landing += 1;
  if (visitor.reachedApp) funnel.app += 1;
  if (visitor.reachedAuth) funnel.auth += 1;
  if (visitor.reachedQuiz) funnel.quiz += 1;
  if (visitor.reachedPractice) funnel.practice += 1;
  if (visitor.reachedConversation) funnel.conversation += 1;
  if (visitor.reachedPaywall) funnel.paywall += 1;
  if (visitor.reachedCheckout) funnel.checkout += 1;
  if (visitor.maxScrollPct >= 25) scrollBuckets[25] += 1;
  if (visitor.maxScrollPct >= 50) scrollBuckets[50] += 1;
  if (visitor.maxScrollPct >= 75) scrollBuckets[75] += 1;
  if (visitor.maxScrollPct >= 100) scrollBuckets[100] += 1;
  if (visitor.landingDurationMs > 0) {
    landingDurationSum += visitor.landingDurationMs;
    landingDurationCount += 1;
  }
  if (visitor.country) countries.push(visitor.country);
  if (visitor.language) languages.push(visitor.language);
  if (visitor.referrerHost) referrers.push(visitor.referrerHost);
  if (visitor.utmSource) utmSources.push(visitor.utmSource);
  if (visitor.firstPath) firstPaths.push(visitor.firstPath);
}

for (const events of Object.values(eventsByVisitorId)) {
  let lastPagePath = '';
  let recordedSpeak = false;
  for (const event of events) {
    if (event.name === 'page_view') lastPagePath = event.path;
    if (event.name === 'page_leave' && event.durationMs > 0 && event.path) {
      const current = durationByPath.get(event.path) || { sum: 0, count: 0 };
      current.sum += event.durationMs;
      current.count += 1;
      durationByPath.set(event.path, current);
    }
    if (event.name === 'paywall_view') paywallViews += 1;
    if (event.name === 'checkout_start') checkoutStarts += 1;
    if (event.name === 'click' && event.ctaIntent) {
      if (ctaClicks[event.ctaIntent] !== undefined) ctaClicks[event.ctaIntent] += 1;
      if (event.ctaIntent === 'quiz') quizCtaIds.push(event.ctaId || 'quiz');
      if (event.ctaIntent === 'signin') signInCtaIds.push(event.ctaId || 'signin');
    }
    if (event.name === 'conversation_start' && !recordedSpeak) {
      recordedSpeak = true;
      conversationStartPaths.push(event.path || '(unknown)');
      pathBeforeSpeak.push(lastPagePath || event.path || '(unknown)');
    }
  }
}

const payload = {
  exportedAtIso: new Date().toISOString(),
  dayKey,
  fromIso,
  toIso,
  visitorCount: visitors.length,
  eventCount: visitors.reduce((sum, visitor) => sum + (visitor.eventCount || 0), 0),
  funnel,
  insights: {
    avgLandingDurationMs: landingDurationCount
      ? Math.round(landingDurationSum / landingDurationCount)
      : 0,
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
    durationByPath: [...durationByPath.entries()]
      .map(([path, value]) => ({
        path,
        count: value.count,
        avgMs: Math.round(value.sum / value.count),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
  },
  dropOff: countBy(visitors.map((visitor) => visitor.lastPath || '(unknown)')).map((row) => ({
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
console.log(
  `Wrote ${visitors.length} visitors for ${dayKey} to ${path.relative(webAppRoot, OUTPUT)}` +
    (skippedCount ? ` (${skippedCount} unengaged page_view-only dropped)` : ''),
);
