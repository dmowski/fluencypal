import { supportedLanguages } from '@/features/Lang/lang';
import {
  StripeCreateCheckoutRequest,
  StripeCreateCheckoutResponse,
} from '@/features/Usage/stripe.types';
import { getUrlStart } from '@/features/Lang/getUrlStart';
import Stripe from 'stripe';
import { isIdentifiedAuthUser } from '@/features/Auth/identifiedAuth';
import { validateAuthToken } from '../config/firebase';
import { stripeConfig } from '../payment/config';
import { pricePerHourUsd } from '@/features/Ai/ai';
import {
  isPaidAccessPlanId,
  paidAccessCheckoutUsd,
  paidAccessGrantForCheckout,
  formatHourCount,
  paidAccessStripeName,
  PaidAccessPlanId,
} from '@/features/Price/paidAccessPlans';
import { ADVANCED_PRICE_PER_HOUR_USD, PRICE_PER_DAY_USD } from '@/features/Price/price';
import { sentSupportTelegramMessage } from '../telegram/sendTelegramMessage';
import { toStripeUnit } from 'zero-decimal-currencies';
import { getConversionRate } from '../currency/getConversionRate';
import { stripeCheckoutTaxCollection, stripeInclusivePriceData } from '../payment/stripeTax';

export async function POST(request: Request) {
  try {
    const stripeKey = stripeConfig.STRIPE_SECRET_KEY;
    const siteUrl = request.headers.get('origin');

    const userInfo = await validateAuthToken(request);
    if (!userInfo.uid || !isIdentifiedAuthUser(userInfo)) {
      throw new Error('User must sign in to start checkout');
    }

    if (!siteUrl) {
      throw new Error('Origin header is not set');
    }
    if (!stripeKey) {
      throw new Error('Stripe API key is not set');
    }
    const stripe = new Stripe(stripeKey);
    const requestData = (await request.json()) as StripeCreateCheckoutRequest;
    const { currency } = requestData;
    const userId = userInfo.uid;

    if (!currency.toLowerCase()) {
      await sentSupportTelegramMessage({
        message: `Currency is not set for user ${userId} in createStripeCheckout API`,
        userId: userInfo.uid,
      });

      throw new Error('Currency is not set');
    }

    const stripeCurrency = currency.toLowerCase();

    const supportedLang = supportedLanguages.find((l) => l === requestData.languageCode) || 'en';
    const rate = await getConversionRate({ currencyFrom: 'USD', currencyTo: currency });

    if ('amountOfHours' in requestData) {
      const amountOfHours = requestData.amountOfHours;
      const hoursCheckout = getHoursCheckoutConfig({
        isAdvancedHours: requestData.product === 'advanced-hours',
        stripeCurrency,
        amountOfHours,
        rate,
        siteUrl,
        languageCode: supportedLang,
      });

      if (amountOfHours > hoursCheckout.maxHours) {
        const response: StripeCreateCheckoutResponse = {
          sessionUrl: null,
          error: 'Amount is too large',
        };
        return Response.json(response);
      }

      if (amountOfHours < hoursCheckout.minHours) {
        const response: StripeCreateCheckoutResponse = {
          sessionUrl: null,
          error: 'Amount is too small',
        };
        return Response.json(response);
      }

      const hoursUsd = amountOfHours * hoursCheckout.pricePerHourInCurrency;
      const stripeMoney = Number(toStripeUnit(hoursUsd, hoursCheckout.currency.toUpperCase()));

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: stripeInclusivePriceData({
              currency: hoursCheckout.currency,
              unitAmount: stripeMoney,
              name: hoursCheckout.name,
              description: hoursCheckout.description,
            }),
            quantity: 1,
          },
        ],
        mode: 'payment',
        ...(hoursCheckout.product === 'advanced-hours'
          ? {}
          : { payment_intent_data: { description: hoursCheckout.description } }),
        ...stripeCheckoutTaxCollection,
        success_url: hoursCheckout.successUrl,
        cancel_url: hoursCheckout.cancelUrl,
        metadata: {
          userId,
          termsAccepted: 'true',
          immediateServiceConsent: 'true',
          amountOfHours,
          product: hoursCheckout.product,
        },
      });

      const response: StripeCreateCheckoutResponse = {
        sessionUrl: session.url,
        error: null,
      };

      return Response.json(response);
    } else {
      const months = requestData.months;
      const days = requestData.days;
      const requestedPlan = requestData.plan;
      if (requestedPlan && !isPaidAccessPlanId(requestedPlan)) {
        const response: StripeCreateCheckoutResponse = {
          sessionUrl: null,
          error: 'Unknown paid access plan',
        };
        return Response.json(response);
      }
      const plan: PaidAccessPlanId = requestedPlan || 'practice';

      if (months > 34 || days > 120) {
        const response: StripeCreateCheckoutResponse = {
          sessionUrl: null,
          error: 'Count is too large',
        };
        return Response.json(response);
      }

      if (months < 0 && days < 0) {
        const response: StripeCreateCheckoutResponse = {
          sessionUrl: null,
          error: 'Count is too small',
        };
        return Response.json(response);
      }

      const isDayPass = months === 0 && days > 0 && days !== 7;
      const planUsd = isDayPass ? null : paidAccessCheckoutUsd({ plan, months, days });
      if (!isDayPass && planUsd == null) {
        const response: StripeCreateCheckoutResponse = {
          sessionUrl: null,
          error: 'Choose a week, month, or year',
        };
        return Response.json(response);
      }

      const totalPrice = Math.round(isDayPass ? PRICE_PER_DAY_USD * rate * days : planUsd! * rate);
      const grant = isDayPass
        ? { advancedHours: 0, communityMonths: 0, communityDays: 0 }
        : paidAccessGrantForCheckout({ plan, months, days });

      const stripeMoney = Number(toStripeUnit(totalPrice, stripeCurrency.toUpperCase()));
      const receiptDescription = isDayPass
        ? `FluencyPal English language course — paid access for ${days} day${days > 1 ? 's' : ''}`
        : paidAccessStripeName(plan, months, days);

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: stripeInclusivePriceData({
              currency: stripeCurrency,
              unitAmount: stripeMoney,
              name: receiptDescription,
              description: receiptDescription,
            }),
            quantity: 1,
          },
        ],
        mode: 'payment',
        payment_intent_data: { description: receiptDescription },
        ...stripeCheckoutTaxCollection,
        success_url: `${siteUrl}${getUrlStart(supportedLang)}practice?paymentModal=true&paymentSuccess=true`,
        cancel_url: `${siteUrl}${getUrlStart(supportedLang)}practice?paymentModal=true`,
        metadata: {
          userId,
          termsAccepted: 'true',
          immediateServiceConsent: 'true',
          amountOfHours: 0,
          amountOfMonths: months,
          amountOfDays: days,
          paidAccessPlan: isDayPass ? 'practice' : plan,
          openAiLiveHours: String(grant.advancedHours),
          fluencyCallMonths: String(grant.communityMonths),
          fluencyCallDays: String(grant.communityDays),
        },
      });

      const response: StripeCreateCheckoutResponse = {
        sessionUrl: session.url,
        error: null,
      };

      return Response.json(response);
    }
  } catch (error) {
    console.error(error);
    const response: StripeCreateCheckoutResponse = {
      sessionUrl: null,
      error: `${error}`,
    };
    return Response.json(response);
  }
}

const getHoursCheckoutConfig = ({
  isAdvancedHours,
  stripeCurrency,
  amountOfHours,
  rate,
  siteUrl,
  languageCode,
}: {
  isAdvancedHours: boolean;
  stripeCurrency: string;
  amountOfHours: number;
  rate: number;
  siteUrl: string;
  languageCode: string;
}) => {
  const practicePath = `${getUrlStart(languageCode)}practice`;
  const advancedPath = `${getUrlStart(languageCode)}advanced`;
  const unitPriceUsd = isAdvancedHours ? ADVANCED_PRICE_PER_HOUR_USD : pricePerHourUsd;

  return {
    currency: isAdvancedHours ? 'usd' : stripeCurrency,
    pricePerHourInCurrency: isAdvancedHours ? unitPriceUsd : unitPriceUsd * rate,
    maxHours: isAdvancedHours ? 20 : 40,
    minHours: isAdvancedHours ? 1 : 0,
    name: isAdvancedHours
      ? 'Advanced AI Talking'
      : `FluencyPal English language course — ${formatHourCount(amountOfHours)} of speaking practice`,
    description: isAdvancedHours
      ? `Add ${amountOfHours} hour(s) of advanced AI talking`
      : `FluencyPal English language course — ${formatHourCount(amountOfHours)} of speaking practice`,
    successUrl: isAdvancedHours
      ? `${siteUrl}${advancedPath}?paymentSuccess=true`
      : `${siteUrl}${practicePath}?paymentModal=true&paymentSuccess=true`,
    cancelUrl: isAdvancedHours
      ? `${siteUrl}${advancedPath}`
      : `${siteUrl}${practicePath}?paymentModal=true`,
    product: isAdvancedHours ? 'advanced-hours' : 'hours',
  };
};
