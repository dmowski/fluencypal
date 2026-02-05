import { UsageLog } from '@/common/usage';
import { addToTotalBalance } from './addToTotalBalance';
import { getDB } from '../config/firebase';
import { getUserBalance } from './getUserBalance';

export const addUsage = async (userId: string, usage: UsageLog) => {
  const balance = await getUserBalance(userId);
  await addToTotalBalance({
    userId,
    amountToAddHours: balance.isGameWinner ? 0 : -usage.priceHours,
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
