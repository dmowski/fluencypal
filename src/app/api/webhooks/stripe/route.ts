import Stripe from "stripe";
import { addPaymentLog } from "../../payment/addPaymentLog";
import { sentSupportTelegramMessage } from "../../telegram/sendTelegramMessage";
import { stripeConfig } from "../../payment/config";

export async function POST(request: Request) {
  if (!stripeConfig.STRIPE_WEBHOOK_SECRET) {
    sentSupportTelegramMessage("Stripe webhook secret is not set");
    throw new Error("Stripe webhook secret is not set");
  }

  const stripeKey = stripeConfig.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    sentSupportTelegramMessage("Stripe API key is not set");
    throw new Error("Stripe API key is not set");
  }
  const stripe = new Stripe(stripeKey);

  const sigFromHeader = request.headers.get("stripe-signature");
  if (!sigFromHeader) {
    sentSupportTelegramMessage("Stripe signature is not set");
    throw new Error("Stripe signature is not set");
  }
  const sig = sigFromHeader;

  let event;
  const body = await request.text();
  event = stripe.webhooks.constructEvent(body, sig, stripeConfig.STRIPE_WEBHOOK_SECRET);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentId = session.id;

    const userId = session.metadata?.userId;
    const amountOfHours = parseFloat(session.metadata?.amountOfHours ?? "0");
    if (amountOfHours <= 0) {
      console.log("Amount of hours is not set");
      throw new Error("Amount of hours is not set");
    }

    if (!userId) {
      console.log("No userId in metadata");
      throw new Error("No userId in metadata");
    }
    const amountPaid = (session.amount_total ?? 0) / 100;

    const currency = session.currency;

    const paymentIntentId = session.payment_intent as string;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const charges = paymentIntent.latest_charge;
    if (!charges) {
      console.log("No charges in payment intent");
      throw new Error("No charges in payment intent");
    }
    const chargeObject = await stripe.charges.retrieve(charges.toString());
    const receiptUrl = chargeObject.receipt_url || "";

    await addPaymentLog({
      amount: amountPaid,
      userId: userId,
      paymentId,
      currency: currency || "usd",
      amountOfHours,
      type: "user",
      receiptUrl,
    });
  } else {
    console.log(`Unhandled event type: ${event.type}`);
    //console.log("event", event);
  }

  return Response.json({ received: true });
}
