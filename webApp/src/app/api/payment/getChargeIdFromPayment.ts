import Stripe from 'stripe';
import { PaymentLog } from '@/features/Usage/usage';
import { stripeConfig } from './config';
import { getChargeIdFromInvoice } from './getChargeIdFromInvoice';

export const getChargeIdFromPayment = async (payment: PaymentLog): Promise<string | null> => {
  if (payment.chargeId) {
    return payment.chargeId;
  }

  const stripeKey = stripeConfig.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return null;
  }

  const stripe = new Stripe(stripeKey);

  if (payment.id.startsWith('in_')) {
    try {
      const chargeId = await getChargeIdFromInvoice(stripe, payment.id);
      return chargeId || null;
    } catch {
      return null;
    }
  }

  if (!payment.id.startsWith('cs_')) {
    return null;
  }

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
