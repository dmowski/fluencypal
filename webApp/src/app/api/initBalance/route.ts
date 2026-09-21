import { InitBalanceResponse } from '../addUsageLog/usageRequest.types';
import { getDB, validateAuthToken } from '../config/firebase';
import { addPaymentLog } from '../payment/addPaymentLog';

/**
 * Bootstraps usage/totalUsage for new accounts without granting trial days.
 * Free users practice with the message limit, then see the paywall.
 */
export async function POST(request: Request) {
  let userInfo: Awaited<ReturnType<typeof validateAuthToken>>;
  try {
    userInfo = await validateAuthToken(request);
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }
  const userId = userInfo.uid;
  const db = getDB();
  const [logsWelcome, logsTrial] = await Promise.all([
    db.collection('users').doc(userId).collection('payments').where('type', '==', 'welcome').get(),
    db
      .collection('users')
      .doc(userId)
      .collection('payments')
      .where('type', '==', 'trial-days')
      .get(),
  ]);

  if (logsWelcome.docs.length > 0 || logsTrial.docs.length > 0) {
    return Response.json(response);
  }

  await addPaymentLog({
    type: 'welcome',
    amount: 0,
    userId: userInfo.uid,
    currency: 'usd',
    amountOfHours: 0,
    paymentId: 'welcome',
  });

  return Response.json(response);
}

const response: InitBalanceResponse = {
  done: true,
};
