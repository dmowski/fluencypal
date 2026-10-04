import { getDB } from '@/app/api/config/firebase';
import { creditUsdMicrosForHours } from '../pricing';
import { openAiLiveAccountRef, openAiLivePaymentRef } from './paths';

/** Removes a credited hour pack. A second call for the same payment does nothing. */
export const reverseOpenAiLiveCredit = async ({
  userId,
  paymentId,
  hours,
}: {
  userId: string;
  paymentId: string;
  hours: number;
}) => {
  if (hours <= 0) return;
  const db = getDB();
  const paymentRef = openAiLivePaymentRef(userId, paymentId);
  const accountRef = openAiLiveAccountRef(userId);
  const debit = creditUsdMicrosForHours(hours);

  await db.runTransaction(async (tx) => {
    const [paymentSnap, accountSnap] = await Promise.all([tx.get(paymentRef), tx.get(accountRef)]);
    if (paymentSnap.data()?.reversedAt) return;
    const current = (accountSnap.data()?.balanceUsdMicros as number | undefined) ?? 0;
    const now = new Date().toISOString();
    tx.set(
      accountRef,
      {
        balanceUsdMicros: Math.max(0, current - debit),
        updatedAt: now,
      },
      { merge: true },
    );
    tx.set(paymentRef, { reversedAt: now }, { merge: true });
  });
};
