import { getDB } from '@/app/api/config/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { shortenFluencyCallAccess } from '../pricing';
import { fluencyCallAccountRef, fluencyCallPaymentRef } from './paths';

/** Pulls back the community-call time granted by one payment. */
export const reverseFluencyCallGrant = async ({
  userId,
  paymentId,
  months = 0,
  days = 0,
}: {
  userId: string;
  paymentId: string;
  months?: number;
  days?: number;
}) => {
  if (months <= 0 && days <= 0) return;
  const db = getDB();
  const paymentRef = fluencyCallPaymentRef(userId, paymentId);
  const accountRef = fluencyCallAccountRef(userId);

  await db.runTransaction(async (tx) => {
    const [paymentSnap, accountSnap] = await Promise.all([tx.get(paymentRef), tx.get(accountRef)]);
    if (paymentSnap.data()?.reversedAt) return;
    const current = (accountSnap.data()?.activeUntilIso as string | null | undefined) ?? null;
    const shortened = shortenFluencyCallAccess(current, { months, days });
    const now = new Date().toISOString();
    tx.set(
      accountRef,
      {
        activeUntilIso: shortened ?? FieldValue.delete(),
        updatedAt: now,
      },
      { merge: true },
    );
    tx.set(paymentRef, { reversedAt: now }, { merge: true });
  });
};
