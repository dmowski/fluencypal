import Stripe from 'stripe';
import { toStripeUnit } from 'zero-decimal-currencies';
import { stripeConfig } from '@/app/api/payment/config';
import { stripeCheckoutTaxCollection, stripeInclusivePriceData } from '@/app/api/payment/stripeTax';
import { getConversionRate } from '@/app/api/currency/getConversionRate';
import { getSupportedCurrency } from '@/app/api/currency/supportedCurrencies';
import { getUrlStart } from '@/features/Lang/getUrlStart';
import { supportedLanguages } from '@/features/Lang/lang';
import {
  creditUsdMicrosForHours,
  isOpenAiLiveHourPack,
  microsToUsd,
  OPEN_AI_LIVE_STRIPE_PRODUCT,
} from '../pricing';

export const createOpenAiLiveCheckout = async ({
  userId,
  hours,
  currency,
  languageCode,
  siteUrl,
}: {
  userId: string;
  hours: number;
  currency: string;
  languageCode: string;
  siteUrl: string;
}) => {
  if (!isOpenAiLiveHourPack(hours)) {
    throw new Error('Choose 1, 3, or 10 hours');
  }
  const stripeKey = stripeConfig.STRIPE_SECRET_KEY;
  if (!stripeKey) throw new Error('Stripe API key is not set');

  const stripeCurrency = getSupportedCurrency(currency || 'usd').toLowerCase();
  const rate =
    stripeCurrency === 'usd'
      ? 1
      : await getConversionRate({ currencyFrom: 'USD', currencyTo: stripeCurrency });
  const priceUsd = microsToUsd(creditUsdMicrosForHours(hours));
  const priceInCurrency = stripeCurrency === 'usd' ? priceUsd : priceUsd * rate;
  const unitAmount = Number(toStripeUnit(priceInCurrency, stripeCurrency.toUpperCase()));
  const lang = supportedLanguages.find((code) => code === languageCode) || 'en';
  const practicePath = `${getUrlStart(lang)}practice`;
  const stripe = new Stripe(stripeKey);
  const hourLabel = hours === 1 ? '1 hour' : `${hours} hours`;
  const receiptDescription = `FluencyPal English language course — ${hourLabel} of live conversation practice`;

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: stripeInclusivePriceData({
          currency: stripeCurrency,
          unitAmount,
          name: receiptDescription,
          description: receiptDescription,
        }),
        quantity: 1,
      },
    ],
    mode: 'payment',
    payment_intent_data: { description: receiptDescription },
    ...stripeCheckoutTaxCollection,
    success_url: `${siteUrl}${practicePath}?openAiLive=paid`,
    cancel_url: `${siteUrl}${practicePath}?openAiLive=buy`,
    metadata: {
      userId,
      termsAccepted: 'true',
      immediateServiceConsent: 'true',
      product: OPEN_AI_LIVE_STRIPE_PRODUCT,
      hours: String(hours),
    },
  });

  if (!session.url) throw new Error('Stripe did not return a checkout URL');
  return session.url;
};
