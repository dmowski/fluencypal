import Stripe from "stripe";
import { addPaymentLog } from "../../payment/addPaymentLog";
import { getFirebaseLink, sentSupportTelegramMessage } from "../../telegram/sendTelegramMessage";
import { stripeConfig } from "../../payment/config";
import { getCommonMessageTemplate } from "../../email/templates/commonMessage";
import { sendEmail } from "../../email/sendEmail";
import { appName } from "@/common/metadata";
import { getUserInfo } from "../../user/getUserInfo";
import { refundPayment } from "../../payment/refund";

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

  try {
    const body = await request.text();
    const event = stripe.webhooks.constructEvent(body, sig, stripeConfig.STRIPE_WEBHOOK_SECRET);
    console.log(`Event type: ${event.type}`);

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
      if (!charges) {
        console.log("No charges in payment intent");
        throw new Error("No charges in payment intent");
      }
      if (!userId) {
        console.log("No userId in metadata");
        throw new Error("No userId in metadata");
      }
      const userInfo = await getUserInfo(userId);
      const userEmail = userInfo.email;
      const firebaseUrl = getFirebaseLink(userId);
      const userLink = `[🔥 Firebase 🔥](${firebaseUrl})`;

      const chargeObject = await stripe.charges.retrieve(charges.toString());
      const receiptUrl = chargeObject.receipt_url || "";
      const receiptId = chargeObject.receipt_number || "";
      const amountPaid = (session.amount_total ?? 0) / 100;

      const months = session.metadata?.amountOfMonths;
      if (months) {
        const monthsCount = parseInt(months, 10);
        if (monthsCount <= 0) {
          console.log("Amount of months is not set");
          throw new Error("Amount of months is not set");
        }

        const tgMessage = `User ${userEmail} subscribed for ${monthsCount} months. | ${userLink}`;
        sentSupportTelegramMessage(tgMessage);
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
        if (amountOfHours <= 0) {
          console.log("Amount of hours is not set");
          throw new Error("Amount of hours is not set");
        }
        const tgMessage = `User ${userEmail} purchased ${amountOfHours} hours. | ${userLink}`;
        sentSupportTelegramMessage(tgMessage);
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

      if (stripeConfig.isStripeLive) {
        const emailToSend = userInfo.email;
        const shortId = receiptId || paymentId.slice(paymentId.length - 8);

        const emailUi = getCommonMessageTemplate({
          title: "Payment Confirmation",
          subtitle: "Hello,<br/>Thank you for your purchase at <b>FluencyPal</b>.",
          messageContent: `
<p style="margin: 0; padding-bottom: 12px; color: #222222">
Due to your request for immediate service from Fundacja Rozwoju Przedsiębiorczości "Twój StartUp" within 14 days of contract conclusion, you do not have the right to terminate the contract.
</p>

<div>
    <p style="padding:20px 0 0 0; margin:0"><b>Please find attached:</b></p>
    <a href="${receiptUrl}">Your receipt ${receiptId ? ` (${receiptId})` : ""}</a><br/>
    <a href="https://www.fluencypal.com/terms">Our Terms and Conditions</a><br/>
    <a href="https://www.fluencypal.com/terms" style="color: #555">Termination form</a>
</div>
`,
          callToAction: "Start Learning",
          callbackUrl: "https://www.fluencypal.com/practice",
        });

        await sendEmail({
          emailTo: emailToSend,
          messageText: emailUi.text,
          messageHtml: emailUi.html,
          title: `Your receipt from ${appName}. #${shortId}`,
        });
      }
    }
  } catch (error) {
    const message = `Error in Stripe webhook: ${(error as Error).message}`;
    sentSupportTelegramMessage(message);
    return new Response(message, { status: 400 });
  }

  return Response.json({ received: true });
}
