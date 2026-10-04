import { getDB } from '@/app/api/config/firebase';
import {
  toPublicSchedule,
  ScheduleSourceCall,
} from '@/features/FluencyCall/backend/publicSchedule';
import { FluencyCallStatus } from '@/features/FluencyCall/types';

const isStatus = (value: unknown): value is FluencyCallStatus =>
  value === 'scheduled' || value === 'stopped';

export async function GET() {
  const snap = await getDB().collection('fluencyCalls').get();
  const sources: ScheduleSourceCall[] = [];

  for (const doc of snap.docs) {
    const data = doc.data();
    if (!isStatus(data.status) || typeof data.startsAtIso !== 'string') continue;
    sources.push({
      id: doc.id,
      startsAtIso: data.startsAtIso,
      status: data.status,
      languageCode: typeof data.languageCode === 'string' ? data.languageCode : null,
      joinCount: 0,
    });
  }

  const listed = toPublicSchedule(sources, new Date());
  const db = getDB();
  const calls = await Promise.all(
    listed.map(async (call) => {
      const rsvps = await db.collection('fluencyCalls').doc(call.id).collection('rsvps').get();
      return { ...call, joinCount: rsvps.size };
    }),
  );

  return Response.json({ calls });
}
