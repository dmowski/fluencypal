import { UsageLog } from '@/features/Usage/usage';
import { isAdvancedRealtimeModel } from '@/features/Usage/advancedUsage';
import { addToTotalBalance } from './addToTotalBalance';
import { getDB } from '../config/firebase';
import { getUserBalance } from './getUserBalance';

export const addUsage = async (userId: string, usage: UsageLog) => {
  const isAdvanced = usage.type === 'realtime' && isAdvancedRealtimeModel(usage.model);
  const balance = await getUserBalance(userId);
  await addToTotalBalance({
    userId,
    amountToAddHours: !isAdvanced && balance.isGameWinner ? 0 : -usage.priceHours,
    isAdvanced,
  });

  const db = getDB();
  const docRef = db.collection(`users/${userId}/usageLogs`).doc(usage.usageId);
  await docRef.set(usage);
};

export const isUsageLogExists = async (userId: string, usageId: string) => {
  const db = getDB();
  const doc = await db.collection(`users/${userId}/usageLogs`).doc(usageId).get();
  return doc.exists;
};
