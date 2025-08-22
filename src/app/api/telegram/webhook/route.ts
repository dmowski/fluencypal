import { envConfig } from "../../config/envConfig";

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
    // sp.currency === "XTR"
    // sp.total_amount: integer in smallest units (Stars)
    // sp.invoice_payload: your payload from createInvoiceLink
    // sp.telegram_payment_charge_id: store for potential refunds

    // 👉 Grant entitlements: add credits, unlock sub, mark order paid in DB
    // await grantEntitlements({ tgUserId: msg.from.id, payload: sp.invoice_payload, stars: sp.total_amount });
    // xxx

    const userId = msg.from.id;
    console.log("userId", userId);
    /*
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
    */

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
