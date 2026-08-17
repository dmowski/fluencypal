import Stripe from 'stripe';
import { getStripeUserInfo, getUserInfo, setStripeUserInfo } from '../user/getUserInfo';

export const getOrCreateCustomerId = async (userId: string, stripe: Stripe): Promise<string> => {
  const existing = await getStripeUserInfo(userId);
  if (existing?.customerId) {
    return existing.customerId;
  }

  const profile = await getUserInfo(userId);
  const email: string | undefined = profile?.email || undefined;

  const customer = await stripe.customers.create(
    {
      email,
      metadata: { firebaseUid: userId },
    },
    {
      idempotencyKey: `customer_${userId}`,
    },
  );

  await setStripeUserInfo(userId, { customerId: customer.id });
  return customer.id;
};
