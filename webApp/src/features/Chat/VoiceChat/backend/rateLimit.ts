import { getDB } from '@/app/api/config/firebase';
import { bumpSpeakingRate, SpeakingRateWindow } from './guards';
import { SpeakingClubError } from './http';

const asWindow = (value: unknown): SpeakingRateWindow | null => {
  if (!value || typeof value !== 'object') return null;
  const data = value as Partial<SpeakingRateWindow>;
  if (typeof data.hourKey !== 'string' || typeof data.dayKey !== 'string') return null;
  return {
    hourKey: data.hourKey,
    dayKey: data.dayKey,
    hourMessages: typeof data.hourMessages === 'number' ? data.hourMessages : 0,
    hourIntros: typeof data.hourIntros === 'number' ? data.hourIntros : 0,
    dayRooms: typeof data.dayRooms === 'number' ? data.dayRooms : 0,
  };
};

export const assertSpeakingRate = async (
  userId: string,
  kind: 'message' | 'intro' | 'room',
): Promise<void> => {
  const ref = getDB().collection('users').doc(userId).collection('speakingRate').doc('window');
  await getDB().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const next = bumpSpeakingRate(asWindow(snap.data()), kind, new Date());
    if (next === 'limited') {
      throw new SpeakingClubError(
        'That is a lot of recordings. Wait a little, then try again.',
        429,
      );
    }
    tx.set(ref, next);
  });
};
