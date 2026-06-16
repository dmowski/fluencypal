import Stripe from 'stripe';
import { PaymentLog } from '@/features/Usage/usage';
import { stripeConfig } from './config';

export const getChargeIdFromPayment = async (payment: PaymentLog): Promise<string | null> => {
  if (payment.chargeId) {
    return payment.chargeId;
  }

  const stripeKey = stripeConfig.STRIPE_SECRET_KEY;
  if (!stripeKey || !payment.id.startsWith('cs_')) {
    return null;
  }

  const stripe = new Stripe(stripeKey);
  try {
    const session = await stripe.checkout.sessions.retrieve(payment.id);
    const paymentIntentId = session.payment_intent;
    if (!paymentIntentId || typeof paymentIntentId !== 'string') {
      return null;
    }
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const chargeId = paymentIntent.latest_charge;
    return chargeId ? chargeId.toString() : null;
  } catch {
    return null;
  }
};
