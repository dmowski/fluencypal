import { createHash } from 'crypto';
import { getDB } from '@/app/api/config/firebase';
import { DEMO_DAILY_LIMIT, DEMO_IP_DAILY_LIMIT, DemoSession } from './policy';

export const demoRef = (uid: string) => getDB().collection('openAiLiveDemos').doc(uid);
export class DemoLimitError extends Error {}

// All reservations are in one transaction: simultaneous starts cannot overspend the cap.
// Reservations are deliberately not refunded on ambiguous provider failures.
export const reserveDemo = async (uid: string, ip: string) => {
  const db = getDB();
  const day = new Date().toISOString().slice(0, 10);
  const daily = db.collection('openAiLiveDemoLimits').doc(day);
  const network = db
    .collection('openAiLiveDemoLimits')
    .doc(`${day}-${createHash('sha256').update(`${day}:${ip}`).digest('hex')}`);
  const configured = Number(process.env.OPEN_AI_LIVE_DEMO_DAILY_LIMIT ?? DEMO_DAILY_LIMIT);
  const cap = Number.isSafeInteger(configured) && configured >= 0 ? configured : 0;
  await db.runTransaction(async (tx) => {
    const [user, total, address] = await tx.getAll(demoRef(uid), daily, network);
    if (user.exists)
      throw new DemoLimitError(
        'Your free demo has already been used. Join FluencyPal to keep practicing.',
      );
    if ((total.data()?.count ?? 0) >= cap || (address.data()?.count ?? 0) >= DEMO_IP_DAILY_LIMIT) {
      throw new DemoLimitError(
        'The free demo is at capacity. Please try again tomorrow or create your learning plan.',
      );
    }
    tx.create(demoRef(uid), {
      uid,
      createdAt: Date.now(),
      sessionId: '',
      startedAt: null,
      closedAt: null,
    });
    tx.set(daily, { count: (total.data()?.count ?? 0) + 1 });
    tx.set(network, { count: (address.data()?.count ?? 0) + 1 });
  });
};

export const readDemo = async (uid: string): Promise<DemoSession | null> => {
  const snapshot = await demoRef(uid).get();
  return snapshot.exists ? (snapshot.data() as DemoSession) : null;
};
