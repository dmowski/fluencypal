import { getUserInfo } from '@/app/api/user/getUserInfo';
import { sentSupportTelegramMessage } from '@/app/api/telegram/sendTelegramMessage';
import { getDB } from '@/app/api/config/firebase';
import { creditUsdMicrosForHours } from '../pricing';
import { openAiLiveAccountRef, openAiLivePaymentRef } from './paths';

export const recordOpenAiLivePayment = async ({
  userId,
  paymentId,
  hours,
  amountPaid,
  currency,
  chargeId,
  receiptUrl,
}: {
  userId: string;
  paymentId: string;
  hours: number;
  amountPaid: number;
  currency: string;
  chargeId: string;
  receiptUrl: string;
}) => {
  const db = getDB();
  const paymentRef = openAiLivePaymentRef(userId, paymentId);
  const accountRef = openAiLiveAccountRef(userId);
  const credit = creditUsdMicrosForHours(hours);

  const alreadyRecorded = await db.runTransaction(async (tx) => {
    const [paymentSnap, accountSnap] = await Promise.all([tx.get(paymentRef), tx.get(accountRef)]);
    if (paymentSnap.exists) return true;
    const current = (accountSnap.data()?.balanceUsdMicros as number | undefined) ?? 0;
    const welcomeGrantedAt = (accountSnap.data()?.welcomeGrantedAt as string | null) ?? null;
    const createdAt = new Date().toISOString();
    tx.set(paymentRef, {
      hours,
      creditedUsdMicros: credit,
      amountPaid,
      currency,
      chargeId,
      receiptUrl,
      createdAt,
    });
    tx.set(
      accountRef,
      {
        balanceUsdMicros: current + credit,
        welcomeGrantedAt,
        updatedAt: createdAt,
      },
      { merge: true },
    );
    return false;
  });

  if (alreadyRecorded) return;

  try {
    const userInfo = await getUserInfo(userId);
    await sentSupportTelegramMessage({
      message: `🤑 User ${userInfo.email || userId} added ${hours} hour(s) of live conversation.`,
      userId,
    });
  } catch (error) {
    console.error('OpenAI Live payment notice failed', error);
  }
};
