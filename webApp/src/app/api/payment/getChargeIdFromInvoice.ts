import Stripe from 'stripe';

export const getChargeIdFromInvoice = async (
  stripe: Stripe,
  invoiceId: string,
): Promise<string> => {
  const payments = await stripe.invoicePayments.list({
    invoice: invoiceId,
    status: 'paid',
  });
  const payment = payments.data[0]?.payment;
  if (!payment) {
    return '';
  }

  if (payment.type === 'charge') {
    return typeof payment.charge === 'string' ? payment.charge : payment.charge?.id || '';
  }

  const paymentIntentId =
    typeof payment.payment_intent === 'string'
      ? payment.payment_intent
      : payment.payment_intent?.id;
  if (!paymentIntentId) {
    return '';
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return paymentIntent.latest_charge ? String(paymentIntent.latest_charge) : '';
};
