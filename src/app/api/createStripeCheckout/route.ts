import { supportedLanguages } from "@/features/Lang/lang";
import { StripeCreateCheckoutRequest, StripeCreateCheckoutResponse } from "@/common/requests";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import Stripe from "stripe";
import { validateAuthToken } from "../config/firebase";
import { stripeConfig } from "../payment/config";

const PRICE_PER_HOUR_USD = 6;

async function getConversionRate(toCurrency: string): Promise<number> {
  const isToCurrencyIsUsd = toCurrency.toLowerCase() === "usd";
  if (isToCurrencyIsUsd) {
    return 1;
  }

  const res = await fetch(
    `https://api.frankfurter.app/latest?from=USD&to=${toCurrency.toUpperCase()}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch conversion rate");
  }

  const data = await res.json();

  const rate = data.rates[toCurrency.toUpperCase()];

  if (!rate) {
    throw new Error(`Conversion rate for ${toCurrency} not found`);
  }

  return rate as number;
}

export async function POST(request: Request) {
  const stripeKey = stripeConfig.STRIPE_SECRET_KEY;
  const siteUrl = request.headers.get("origin");

  const userInfo = await validateAuthToken(request);
  if (!userInfo.uid) {
    throw new Error("User is not authenticated");
  }

  if (!siteUrl) {
    throw new Error("Origin header is not set");
  }
  if (!stripeKey) {
    throw new Error("Stripe API key is not set");
  }
  const stripe = new Stripe(stripeKey);
  const requestData = (await request.json()) as StripeCreateCheckoutRequest;
  const { amountOfHours, userId, currency } = requestData;
  if (amountOfHours > 400) {
    const response: StripeCreateCheckoutResponse = {
      sessionUrl: null,
      error: "Amount is too large",
    };
    return Response.json(response);
  }

  if (amountOfHours < 0) {
    const response: StripeCreateCheckoutResponse = {
      sessionUrl: null,
      error: "Amount is too small",
    };
    return Response.json(response);
  }

  const supportedLang = supportedLanguages.find((l) => l === requestData.languageCode) || "en";

  const rate = await getConversionRate(currency.toLowerCase());

  const pricePerHourInCurrency = PRICE_PER_HOUR_USD * rate;

  const money = Math.round(amountOfHours * pricePerHourInCurrency * 100);
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase() || "pln",
            product_data: {
              name: "Balance Top-up",
              description: `Add ${amountOfHours} hours to your account balance`,
            },
            unit_amount: money,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${siteUrl}${getUrlStart(supportedLang)}practice?paymentModal=true&paymentSuccess=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}${getUrlStart(supportedLang)}practice?paymentModal=true&paymentCanceled=true`,
      metadata: { userId, termsAccepted: "true", immediateServiceConsent: "true", amountOfHours },
    });

    const response: StripeCreateCheckoutResponse = {
      sessionUrl: session.url,
      error: null,
    };

    return Response.json(response);
  } catch (error) {
    console.error(error);
    const response: StripeCreateCheckoutResponse = {
      sessionUrl: null,
      error: `${error}`,
    };
    return Response.json(response);
  }
}
