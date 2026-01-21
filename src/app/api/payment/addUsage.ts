import { UsageLog } from '@/common/usage';
import { addToTotalBalance } from './addToTotalBalance';
import { getDB } from '../config/firebase';

export const addUsage = async (userId: string, usage: UsageLog) => {
  await addToTotalBalance({
    userId,
    amountToAddHours: -usage.priceHours,
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
