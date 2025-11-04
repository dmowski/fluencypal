import Stripe from "stripe";
import { SetupIntentResponse } from "../type";
import { validateAuthToken } from "../../config/firebase";
import {
  getStripeUserInfo,
  getUserInfo,
  setStripeUserInfo,
  StripeUserInfo,
} from "../../user/getUserInfo";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
if (!STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}
const stripe = new Stripe(STRIPE_SECRET_KEY);

const getOrCreateCustomerId = async (userId: string): Promise<string> => {
  // 1) check cached mapping
  const existing = await getStripeUserInfo(userId);
  if (existing?.customerId) {
    return existing.customerId;
  }

  // 2) get profile
  const profile = await getUserInfo(userId);
  const email: string | undefined = profile?.email || undefined;

  // 4) Create with idempotency key to guard races
  const customer = await stripe.customers.create(
    {
      email, // may be undefined, Stripe accepts that
      metadata: { firebaseUid: userId },
    },
    {
      idempotencyKey: `create_customer_${userId}`, // same uid → same op
    }
  );

  const newInfo: StripeUserInfo = { customerId: customer.id };
  await setStripeUserInfo(userId, newInfo);
  return customer.id;
};

export async function POST(request: Request) {
  try {
    const authed = await validateAuthToken(request);
    if (!authed) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const userId = authed.uid;
    const customerId = await getOrCreateCustomerId(userId);

    const setupIntent = await stripe.setupIntents.create(
      {
        customer: customerId,
        payment_method_types: ["card"],
        usage: "off_session",
        // Explicit but optional:
        payment_method_options: {
          card: { request_three_d_secure: "automatic" },
        },
        // You can tag the SI too, if you want to trace:
        metadata: { firebaseUid: userId, purpose: "fluencypal_card_verification" },
      },
      {
        idempotencyKey: `create_setup_intent_${userId}_${Date.now()}`, // 1 SI per click
      }
    );

    const response: SetupIntentResponse = {
      clientSecret: setupIntent.client_secret!,
    };
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (err: any) {
    // Map Stripe errors to 4xx where appropriate
    const code = err?.statusCode ?? 500;
    const message = err?.raw?.message || err?.message || "Unable to create SetupIntent";
    // Log safe context (no secrets)
    console.error("createSetupIntent error:", { code, message });
    return new Response(JSON.stringify({ error: message }), { status: code });
  }
}
