import Stripe from "stripe";
import { addPaymentLog } from "../../payment/addPaymentLog";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(request: Request) {
  if (!endpointSecret) {
    throw new Error("Stripe webhook secret is not set");
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY as string;
  if (!stripeKey) {
    throw new Error("Stripe API key is not set");
  }
  const stripe = new Stripe(stripeKey);

  const sigFromHeader = request.headers.get("stripe-signature");
  if (!sigFromHeader) {
    throw new Error("Stripe signature is not set");
  }
  const sig = sigFromHeader;

  let event;
  const body = await request.text();
  event = stripe.webhooks.constructEvent(body, sig, endpointSecret);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentId = session.id;
    //console.log("session", session);
    const userId = session.metadata?.userId;
    if (!userId) {
      console.log("No userId in metadata");
      throw new Error("No userId in metadata");
    }
    const amountPaid = (session.amount_total ?? 0) / 100;
    console.log(`User ${userId} paid $${amountPaid}`);
    await addPaymentLog(amountPaid, userId, paymentId);
  } else {
    console.log(`Unhandled event type: ${event.type}`);
    //console.log("event", event);
  }

  return Response.json({ received: true });
}
