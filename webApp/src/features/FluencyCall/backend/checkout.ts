import Stripe from 'stripe';
import { toStripeUnit } from 'zero-decimal-currencies';
import { stripeConfig } from '@/app/api/payment/config';
import { stripeCheckoutTaxCollection, stripeInclusivePriceData } from '@/app/api/payment/stripeTax';
import { getConversionRate } from '@/app/api/currency/getConversionRate';
import { getSupportedCurrency } from '@/app/api/currency/supportedCurrencies';
import { getUrlStart } from '@/features/Lang/getUrlStart';
import { supportedLanguages } from '@/features/Lang/lang';
import { FLUENCY_CALL_PRICE_USD, FLUENCY_CALL_STRIPE_PRODUCT } from '../pricing';

export const createFluencyCallCheckout = async ({
  userId,
  currency,
  languageCode,
  siteUrl,
}: {
  userId: string;
  currency: string;
  languageCode: string;
  siteUrl: string;
}) => {
  const stripeKey = stripeConfig.STRIPE_SECRET_KEY;
  if (!stripeKey) throw new Error('Stripe API key is not set');

  const stripeCurrency = getSupportedCurrency(currency || 'usd').toLowerCase();
  const rate =
    stripeCurrency === 'usd'
      ? 1
      : await getConversionRate({ currencyFrom: 'USD', currencyTo: stripeCurrency });
  const priceInCurrency =
    stripeCurrency === 'usd' ? FLUENCY_CALL_PRICE_USD : FLUENCY_CALL_PRICE_USD * rate;
  const unitAmount = Number(toStripeUnit(priceInCurrency, stripeCurrency.toUpperCase()));
  const lang = supportedLanguages.find((code) => code === languageCode) || 'en';
  const practicePath = `${getUrlStart(lang)}practice`;
  const stripe = new Stripe(stripeKey);

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: stripeInclusivePriceData({
          currency: stripeCurrency,
          unitAmount,
          name: 'Group conversations',
          description: 'One month of group conversations on Google Meet',
        }),
        quantity: 1,
      },
    ],
    mode: 'payment',
    ...stripeCheckoutTaxCollection,
    success_url: `${siteUrl}${practicePath}?fluencyCall=paid`,
    cancel_url: `${siteUrl}${practicePath}?fluencyCall=buy`,
    metadata: {
      userId,
      termsAccepted: 'true',
      immediateServiceConsent: 'true',
      product: FLUENCY_CALL_STRIPE_PRODUCT,
    },
  });

  if (!session.url) throw new Error('Stripe did not return a checkout URL');
  return session.url;
};
