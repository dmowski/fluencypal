import { getUserInfo } from '@/app/api/user/getUserInfo';
import { sentSupportTelegramMessage } from '@/app/api/telegram/sendTelegramMessage';
import { getDB } from '@/app/api/config/firebase';
import { extendFluencyCallAccessFor } from '../pricing';
import { fluencyCallAccountRef, fluencyCallPaymentRef } from './paths';

export const recordFluencyCallPayment = async ({
  userId,
  paymentId,
  amountPaid,
  currency,
  chargeId,
  receiptUrl,
  months = 1,
  days = 0,
  notify = true,
}: {
  userId: string;
  paymentId: string;
  amountPaid: number;
  currency: string;
  chargeId: string;
  receiptUrl: string;
  months?: number;
  days?: number;
  notify?: boolean;
}) => {
  const db = getDB();
  const paymentRef = fluencyCallPaymentRef(userId, paymentId);
  const accountRef = fluencyCallAccountRef(userId);
  const now = new Date();

  const alreadyRecorded = await db.runTransaction(async (tx) => {
    const [paymentSnap, accountSnap] = await Promise.all([tx.get(paymentRef), tx.get(accountRef)]);
    if (paymentSnap.exists) return true;
    const current = (accountSnap.data()?.activeUntilIso as string | null | undefined) ?? null;
    const activeUntilIso = extendFluencyCallAccessFor(current, now, {
      months: months || undefined,
      days: days || undefined,
    });
    const createdAt = now.toISOString();
    tx.set(paymentRef, {
      amountPaid,
      currency,
      chargeId,
      receiptUrl,
      activeUntilIso,
      createdAt,
    });
    tx.set(
      accountRef,
      {
        activeUntilIso,
        updatedAt: createdAt,
      },
      { merge: true },
    );
    return false;
  });

  if (alreadyRecorded || !notify) return;

  try {
    const userInfo = await getUserInfo(userId);
    await sentSupportTelegramMessage({
      message: `🤑 User ${userInfo.email || userId} paid for a month of group conversations.`,
      userId,
    });
  } catch (error) {
    console.error('Fluency call payment notice failed', error);
  }
};
