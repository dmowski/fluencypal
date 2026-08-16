import { PaymentLog } from '@/features/Usage/usage';
import { addToTotalBalance } from './addToTotalBalance';
import { getUserBalance } from './getUserBalance';
import { getDB } from '../config/firebase';
import dayjs from 'dayjs';
import { FieldValue } from 'firebase-admin/firestore';

export const reversePaymentBalance = async (userId: string, payment: PaymentLog) => {
  if (payment.amountOfMonth || payment.amountOfDays) {
    const balance = await getUserBalance(userId);
    if (balance.activeSubscriptionTill) {
      const currentEnd = dayjs(balance.activeSubscriptionTill);
      const newEnd = payment.amountOfMonth
        ? currentEnd.subtract(payment.amountOfMonth, 'month')
        : currentEnd.subtract(payment.amountOfDays, 'day');

      const db = getDB();
      const update: Record<string, unknown> = {
        lastUpdatedAt: Date.now(),
      };

      if (newEnd.isAfter(dayjs())) {
        update.activeSubscriptionTill = newEnd.toISOString();
      } else {
        update.activeSubscriptionTill = FieldValue.delete();
      }

      await db
        .collection('users')
        .doc(userId)
        .collection('usage')
        .doc('totalUsage')
        .set(update, { merge: true });
    }
    return;
  }

  if (payment.amountOfHours > 0) {
    await addToTotalBalance({
      userId,
      amountToAddHours: -payment.amountOfHours,
      isAdvanced: payment.type === 'advanced-hours',
    });
  }
};
