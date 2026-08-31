import {
  AnalyticsVisitorDoc,
  JourneyDropOffRow,
  JourneyFunnel,
  JourneyOsRow,
  JourneySummary,
} from '../types';
import { isReportableVisitor } from '../isReportableVisitor';

const countBy = (items: string[]): { key: string; count: number }[] => {
  const map = new Map<string, number>();
  for (const item of items) {
    map.set(item, (map.get(item) || 0) + 1);
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
};

export const summarizeJourneys = (
  dayKey: string,
  visitors: AnalyticsVisitorDoc[],
): JourneySummary => {
  const counted = visitors.filter(isReportableVisitor);
  const dropOff: JourneyDropOffRow[] = countBy(
    counted.map((visitor) => visitor.lastPath || '(unknown)'),
  ).map((row) => ({
    path: row.key,
    count: row.count,
  }));

  const funnel: JourneyFunnel = {
    landing: 0,
    app: 0,
    auth: 0,
    quiz: 0,
    practice: 0,
    conversation: 0,
    speech: 0,
    paywall: 0,
    checkout: 0,
  };
  for (const visitor of counted) {
    if (visitor.reachedLanding) funnel.landing += 1;
    if (visitor.reachedApp) funnel.app += 1;
    if (visitor.reachedAuth) funnel.auth += 1;
    if (visitor.reachedQuiz) funnel.quiz += 1;
    if (visitor.reachedPractice) funnel.practice += 1;
    if (visitor.reachedConversation) funnel.conversation += 1;
    if (visitor.reachedSpeech) funnel.speech += 1;
    if (visitor.reachedPaywall) funnel.paywall += 1;
    if (visitor.reachedCheckout) funnel.checkout += 1;
  }

  const os: JourneyOsRow[] = countBy(counted.map((visitor) => visitor.os || 'Unknown OS')).map(
    (row) => ({
      os: row.key,
      count: row.count,
    }),
  );

  const eventCount = counted.reduce((sum, visitor) => sum + (visitor.eventCount || 0), 0);

  return {
    dayKey,
    visitorCount: counted.length,
    eventCount,
    dropOff,
    funnel,
    os,
    visitors: counted.slice().sort((a, b) => b.lastSeenAtIso.localeCompare(a.lastSeenAtIso)),
  };
};
