import Stripe from "stripe";
import { stripeConfig } from "./config";
import { sentSupportTelegramMessage } from "../telegram/sendTelegramMessage";
/*

review if card_count_for_email_all_time < 5
review if card_count_for_ip_address_all_time < 10
review if blocked_charges_per_card_number_daily < 2
review if blocked_charges_per_email_daily < 2
review if blocked_charges_per_ip_address_daily < 5
review if distance_between_ip_and_billing_address < 2000 (km)
review if efw_count_on_card_all_time < 1
review if is_disposable_email = true
review if email_count_for_card_all_time < 3
*/

export const refundPayment = async (chargeId: string): Promise<boolean> => {
  sentSupportTelegramMessage({
    message: "Refund requested for charge: " + chargeId,
  });
  if (!stripeConfig.STRIPE_WEBHOOK_SECRET) {
    sentSupportTelegramMessage({ message: "Stripe webhook secret is not set" });
    throw new Error("Stripe webhook secret is not set");
  }

  const stripeKey = stripeConfig.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    sentSupportTelegramMessage({ message: "Stripe API key is not set" });
    throw new Error("Stripe API key is not set");
  }

  const stripe = new Stripe(stripeKey);

  try {
    const refundResult = await stripe.refunds.create({
      charge: chargeId,
    });

    const status = refundResult.status || "-";
    sentSupportTelegramMessage({
      message:
        "Refund successful: " +
        chargeId +
        " | " +
        (refundResult.failure_reason || "") +
        " | Status: " +
        status,
    });
    return true;
  } catch (error) {
    sentSupportTelegramMessage({ message: "Refund failed: " + chargeId });
    sentSupportTelegramMessage({
      message:
        "Refund failed error: " + (error as Error).message || "Unknown error",
    });
    console.error(error);
    return false;
  }
};
