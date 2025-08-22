import { envConfig } from "../../config/envConfig";
import { addPaymentLog } from "../../payment/addPaymentLog";

export const runtime = "nodejs";
const BOT_TOKEN = envConfig.telegramBotKey;
const isTest = false;
const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}${isTest ? "/test" : ""}`;

// Respond helper
async function call(method: string, payload: any) {
  return fetch(`${TG_API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function POST(req: Request) {
  const update = (await req.json()) as any;

  // 1) Approve pre-checkout
  if (update.pre_checkout_query) {
    const q = update.pre_checkout_query;
    console.log("Approve pre-checkout:", q);
    // Optional: validate q.invoice_payload, user eligibility, stock, etc.
    await call("answerPreCheckoutQuery", { pre_checkout_query_id: q.id, ok: true });
    return new Response("ok");
  }

  // 2) Fulfill on successful payment
  const msg = update.message;
  console.log("TG webhook message:", msg);
  if (msg?.successful_payment) {
    const sp = msg.successful_payment;
    console.log("SP", sp);

    const userId = msg.from.id;
    const firebaseUserId = `tg:${userId}`;
    console.log("firebaseUserId", firebaseUserId);
    const startCount = sp.total_amount;
    const currency = sp.currency;

    await addPaymentLog({
      amount: startCount,
      userId: firebaseUserId,
      paymentId: sp.telegram_payment_charge_id,
      currency,
      amountOfHours: 0,
      type: "subscription-full-v1",
      receiptUrl: sp.invoice_payload,
      monthsCount: 1,
    });

    // Optional: confirm back to the user
    await call("sendMessage", {
      chat_id: msg.chat.id,
      text: `✅ Payment received! Thanks for your purchase.`,
    });

    return new Response("ok");
  }

  return new Response("ok");
}

export async function GET() {
  return new Response("Telegram webhook GET");
}
