import { StripeCreateCheckoutRequest, StripeCreateCheckoutResponse } from "@/common/requests";
import Stripe from "stripe";

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY as string;
  const siteUrl = request.headers.get("origin");

  if (!siteUrl) {
    throw new Error("Origin header is not set");
  }
  if (!stripeKey) {
    throw new Error("Stripe API key is not set");
  }
  const stripe = new Stripe(stripeKey);
  const requestData = (await request.json()) as StripeCreateCheckoutRequest;
  const { amount, userId } = requestData;
  if (amount > 400) {
    const response: StripeCreateCheckoutResponse = {
      sessionUrl: null,
      error: "Amount is too large",
    };
    return Response.json(response);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Balance Top-up",
              description: `Add $${amount} to your account balance`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${siteUrl}/practice?paymentModal=true&paymentSuccess=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/practice?paymentModal=true&paymentCanceled=true`,
      metadata: { userId },
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
