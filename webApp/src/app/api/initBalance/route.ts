import { InitBalanceResponse } from '../addUsageLog/usageRequest.types';
import { getDB, validateAuthToken } from '../config/firebase';
import { WELCOME_BONUS } from '@/features/Usage/usage';
import { addPaymentLog } from '../payment/addPaymentLog';
import { TRIAL_DAYS, TRIAL_MINUTES } from '@/features/Price/price';

export async function POST(request: Request) {
  const userInfo = await validateAuthToken(request);
  const userId = userInfo.uid;
  const db = getDB();
  const [logsHours, logsDays] = await Promise.all([
    db.collection('users').doc(userId).collection('payments').where('type', '==', 'welcome').get(),
    db
      .collection('users')
      .doc(userId)
      .collection('payments')
      .where('type', '==', 'trial-days')
      .get(),
  ]);

  if (logsHours.docs.length > 0 || logsDays.docs.length > 0) {
    return Response.json(response);
  }

  await addPaymentLog({
    type: 'trial-days',
    amount: WELCOME_BONUS,
    userId: userInfo.uid,
    currency: 'usd',
    amountOfHours: 0,
    paymentId: 'trial-days',
    daysCount: TRIAL_DAYS,
  });

  return Response.json(response);
}

const response: InitBalanceResponse = {
  done: true,
};
