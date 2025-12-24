import Stripe from "stripe";
import { addPaymentLog } from "../../payment/addPaymentLog";
import { sentSupportTelegramMessage } from "../../telegram/sendTelegramMessage";
import { stripeConfig } from "../../payment/config";
import { sendEmail } from "../../email/sendEmail";
import { appName } from "@/common/metadata";
import { getUserInfo, updateUserInfo } from "../../user/getUserInfo";
import { refundPayment } from "../../payment/refund";
import { getConfirmEmailTemplate } from "./getConfirmEmailTemplate";

const stripe = new Stripe(stripeConfig.STRIPE_SECRET_KEY!);

const markUserAsCreditCardConfirmed = async (userId: string, isConfirmed: boolean) => {
  await updateUserInfo(userId, { isCreditCardConfirmed: isConfirmed });
};

export async function POST(request: Request) {
  if (!stripeConfig.STRIPE_WEBHOOK_SECRET) {
    sentSupportTelegramMessage({ message: "Stripe webhook secret is not set" });
    return new Response("Stripe webhook secret is not set", { status: 500 });
  }
  if (!stripeConfig.STRIPE_SECRET_KEY) {
    sentSupportTelegramMessage({ message: "Stripe API key is not set" });
    return new Response("Stripe API key is not set", { status: 500 });
  }

  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    sentSupportTelegramMessage({ message: "Stripe signature is not set" });
    return new Response("Stripe signature is not set", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await request.text(); // raw body for signature verification
    event = stripe.webhooks.constructEvent(body, sig, stripeConfig.STRIPE_WEBHOOK_SECRET);
  } catch (error: any) {
    const message = `Error verifying Stripe signature: ${error.message}`;
    sentSupportTelegramMessage({ message });
    return new Response(message, { status: 400 });
  }

  const responseData: Record<string, string> = {};

  try {
    console.log("event.type", event.type);
    // --- NEW: SetupIntent handling for card verification ---
    if (event.type === "setup_intent.succeeded") {
      const si = event.data.object as Stripe.SetupIntent;
      const customerId = si.customer as string | null;
      console.log("customerId setup_intent.succeeded", customerId);
      responseData.event = event.type;

      let firebaseUid: string | undefined;
      if (customerId) {
        const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;
        firebaseUid = customer?.metadata?.firebaseUid;
        console.log("firebaseUid", firebaseUid);
      }

      if (firebaseUid) {
        responseData.start_intent = "marking user as credit card confirmed";
        await markUserAsCreditCardConfirmed(firebaseUid, true);
        console.log("Marked user as credit card confirmed:", firebaseUid);
        await sentSupportTelegramMessage({
          message: `✅ Card verified via SetupIntent for user ${firebaseUid}`,
          userId: firebaseUid,
        });
        console.log("Sent Telegram message for user:", firebaseUid);
      } else {
        // No uid on customer; nothing to update, but notify so you can investigate.
        sentSupportTelegramMessage({
          message: `⚠️ setup_intent.succeeded without firebaseUid on customer ${customerId}`,
        });
      }
    }

    // Optional: inform/support on explicit failures/cancelations
    if (event.type === "setup_intent.setup_failed" || event.type === "setup_intent.canceled") {
      const si = event.data.object as Stripe.SetupIntent;
      const customerId = si.customer as string | null;
      let firebaseUid: string | undefined;
      if (customerId) {
        const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;
        firebaseUid = customer?.metadata?.firebaseUid;
      }
      sentSupportTelegramMessage({
        message: `❌ Card verification failed: ${event.type} (customer: ${customerId}, uid: ${
          firebaseUid ?? "n/a"
        })`,
        userId: firebaseUid,
      });
      // Do NOT set isCreditCardConfirmed to false here; leaving as-is is safest/idempotent.
    }

    // --- existing handlers you already had ---
    if (event.type == "radar.early_fraud_warning.created") {
      const earlyFraudWarning = event.data.object as Stripe.Radar.EarlyFraudWarning;
      const chargeId = earlyFraudWarning.charge as string;
      await refundPayment(chargeId);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentId = session.id;

      const userId = session.metadata?.userId;
      const currency = session.currency;

      const paymentIntentId = session.payment_intent as string;
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      const charges = paymentIntent.latest_charge;
      if (!charges) throw new Error("No charges in payment intent");
      if (!userId) throw new Error("No userId in metadata");

      const userInfo = await getUserInfo(userId);
      const userEmail = userInfo.email;

      const chargeObject = await stripe.charges.retrieve(charges.toString());
      const receiptUrl = chargeObject.receipt_url || "";
      const receiptId = chargeObject.receipt_number || "";
      const amountPaid = (session.amount_total ?? 0) / 100;

      const months = session.metadata?.amountOfMonths;
      if (months) {
        const monthsCount = parseInt(months, 10);
        if (monthsCount <= 0) throw new Error("Amount of months is not set");

        const tgMessage = `User ${userEmail} subscribed for ${monthsCount} months.`;
        sentSupportTelegramMessage({ message: tgMessage, userId });
        await addPaymentLog({
          amount: amountPaid,
          userId: userId,
          paymentId,
          currency: currency || "pln",
          amountOfHours: 0,
          type: "subscription-full-v1",
          receiptUrl,
          monthsCount: monthsCount,
        });
      } else {
        const amountOfHours = parseFloat(session.metadata?.amountOfHours ?? "0");
        if (amountOfHours <= 0) throw new Error("Amount of hours is not set");

        const tgMessage = `User ${userEmail} purchased ${amountOfHours} hours.`;
        sentSupportTelegramMessage({ message: tgMessage, userId });
        await addPaymentLog({
          amount: amountPaid,
          userId: userId,
          paymentId,
          currency: currency || "usd",
          amountOfHours,
          type: "user",
          receiptUrl,
        });
      }

      await markUserAsCreditCardConfirmed(userId, true);

      if (stripeConfig.isStripeLive && userInfo.email) {
        const emailToSend = userInfo.email;
        const shortId = receiptId || paymentId.slice(paymentId.length - 8);
        const emailUi = getConfirmEmailTemplate({
          receiptUrl,
          receiptId,
        });

        await sendEmail({
          emailTo: emailToSend,
          messageText: emailUi.text,
          messageHtml: emailUi.html,
          title: `Your receipt from ${appName}. #${shortId}`,
        });
      }
    }
  } catch (error: any) {
    const message = `Error in Stripe webhook: ${error.message}`;
    sentSupportTelegramMessage({ message });
    return new Response(message, { status: 400 });
  }

  return Response.json({ received: true, ...responseData });
}
