import { getDB } from '@/app/api/config/firebase';
import { AnalyticsEventDoc, AnalyticsVisitorDoc, JourneyResponse } from '../types';
import { eventsCollectionName, visitorsCollectionName } from './collections';
import { summarizeJourneys } from './summarizeJourneys';

const MAX_VISITORS = 400;
const MAX_EVENTS_PER_VISITOR = 300;

export const getJourneySummary = async (input: {
  dayKey: string;
  fromIso: string;
  toIso: string;
}): Promise<JourneyResponse> => {
  const db = getDB();
  const snapshot = await db
    .collection(visitorsCollectionName)
    .where('lastSeenAtIso', '>=', input.fromIso)
    .where('lastSeenAtIso', '<=', input.toIso)
    .orderBy('lastSeenAtIso', 'desc')
    .limit(MAX_VISITORS)
    .get();

  const visitors = snapshot.docs.map((doc) => doc.data() as AnalyticsVisitorDoc);
  return {
    type: 'summary',
    summary: summarizeJourneys(input.dayKey, visitors),
  };
};

export const getVisitorJourney = async (visitorId: string): Promise<JourneyResponse> => {
  const db = getDB();
  const visitorSnap = await db.collection(visitorsCollectionName).doc(visitorId).get();
  const eventsSnap = await db
    .collection(eventsCollectionName)
    .where('visitorId', '==', visitorId)
    .limit(MAX_EVENTS_PER_VISITOR)
    .get();

  const events = eventsSnap.docs
    .map((doc) => doc.data() as AnalyticsEventDoc)
    .sort((a, b) => a.createdAtMs - b.createdAtMs);

  return {
    type: 'visitor',
    visitor: visitorSnap.exists ? (visitorSnap.data() as AnalyticsVisitorDoc) : null,
    events,
  };
};
