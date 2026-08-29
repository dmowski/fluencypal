import { cookies } from 'next/headers';
import { supportedLanguages } from '@/features/Lang/lang';
import {
  StripeCreateCheckoutRequest,
  StripeCreateCheckoutResponse,
} from '@/features/Usage/stripe.types';
import { getUrlStart } from '@/features/Lang/getUrlStart';
import Stripe from 'stripe';
import { validateAuthToken } from '../config/firebase';
import { stripeConfig } from '../payment/config';
import { pricePerHourUsd } from '@/features/Ai/ai';
import {
  ADVANCED_PRICE_PER_HOUR_USD,
  PRICE_PER_DAY_USD,
  PRICE_PER_MONTH_USD,
  PRICE_PER_WEEK_USD,
  PRICE_PER_YEAR_USD,
} from '@/features/Price/price';
import { sentSupportTelegramMessage } from '../telegram/sendTelegramMessage';
import { toStripeUnit } from 'zero-decimal-currencies';
import { getConversionRate } from '../currency/getConversionRate';
import { stripeCheckoutTaxCollection, stripeInclusivePriceData } from '../payment/stripeTax';

export async function POST(request: Request) {
  try {
    const stripeKey = stripeConfig.STRIPE_SECRET_KEY;
    const siteUrl = request.headers.get('origin');

    const userInfo = await validateAuthToken(request);
    if (!userInfo.uid) {
      throw new Error('User is not authenticated');
    }

    if (!siteUrl) {
      throw new Error('Origin header is not set');
    }
    if (!stripeKey) {
      throw new Error('Stripe API key is not set');
    }
    const stripe = new Stripe(stripeKey);
    const cookieStore = await cookies();
    const datafastVisitorId = cookieStore.get('datafast_visitor_id')?.value;
    const datafastSessionId = cookieStore.get('datafast_session_id')?.value;
    const requestData = (await request.json()) as StripeCreateCheckoutRequest;
    const { userId, currency } = requestData;

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
        ...stripeCheckoutTaxCollection,
        success_url: hoursCheckout.successUrl,
        cancel_url: hoursCheckout.cancelUrl,
        metadata: {
          userId,
          termsAccepted: 'true',
          immediateServiceConsent: 'true',
          amountOfHours,
          product: hoursCheckout.product,
          ...(datafastVisitorId ? { datafast_visitor_id: datafastVisitorId } : {}),
          ...(datafastSessionId ? { datafast_session_id: datafastSessionId } : {}),
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

      const isWeek = days === 7;
      const isYear = months === 12;

      // Calculate total price
      const totalMonth = PRICE_PER_MONTH_USD * rate * months;
      const totalWeek = PRICE_PER_WEEK_USD * rate;
      const totalYear = PRICE_PER_YEAR_USD * rate;
      const totalDay = PRICE_PER_DAY_USD * rate * days;

      const totalPrice = Math.round(
        isYear ? totalYear : isWeek ? totalWeek : days ? totalDay : totalMonth,
      );

      const stripeMoney = Number(toStripeUnit(totalPrice, stripeCurrency.toUpperCase()));

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: stripeInclusivePriceData({
              currency: stripeCurrency,
              unitAmount: stripeMoney,
              name: getSubscriptionProductName(months, days),
              description: getSubscriptionProductDescription(months, days),
            }),
            quantity: 1,
          },
        ],
        mode: 'payment',
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
          ...(datafastVisitorId ? { datafast_visitor_id: datafastVisitorId } : {}),
          ...(datafastSessionId ? { datafast_session_id: datafastSessionId } : {}),
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
    name: isAdvancedHours ? 'Advanced AI Talking' : 'Balance Top-up',
    description: isAdvancedHours
      ? `Add ${amountOfHours} hour(s) of advanced AI talking`
      : `Add ${amountOfHours} hours to your account balance`,
    successUrl: isAdvancedHours
      ? `${siteUrl}${advancedPath}?paymentSuccess=true`
      : `${siteUrl}${practicePath}?paymentModal=true&paymentSuccess=true`,
    cancelUrl: isAdvancedHours
      ? `${siteUrl}${advancedPath}`
      : `${siteUrl}${practicePath}?paymentModal=true`,
    product: isAdvancedHours ? 'advanced-hours' : 'hours',
  };
};

const getSubscriptionProductName = (months: number, days: number) => {
  if (months === 12) return 'Full Access for a Year';
  if (days === 7) return 'Full Access for a Week';
  if (days) return `Full Access for ${days} day${days > 1 ? 's' : ''}`;
  return `Full Access for ${months} month${months > 1 ? 's' : ''}`;
};

const getSubscriptionProductDescription = (months: number, days: number) => {
  if (days === 7) return 'Add 1 week to your account balance';
  if (days) return `Add ${days} day${days > 1 ? 's' : ''} to your account balance`;
  return `Add ${months} month${months > 1 ? 's' : ''} to your account balance`;
};
