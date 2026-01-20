import { envConfig } from "../../config/envConfig";
import { TonApiClient } from "@ton-api/client";
import { getOrderByComment, updateOrder } from "../../payment/order";
import { addPaymentLog } from "../../payment/addPaymentLog";
import { sentSupportTelegramMessage } from "../../telegram/sendTelegramMessage";

interface TX {
  event_type: string;
  account_id: string;
  lt: number;
  tx_hash: string;
}

const ta = new TonApiClient({
  baseUrl: "https://tonapi.io",
  apiKey: envConfig.tonApiKey,
});

export async function POST(request: Request) {
  const body = await request.json();
  console.log("POST /api/crypto/webhook");
  console.log("Webhook received:", body);

  const tx: TX = body;

  if (envConfig.merchantTonAddressHash !== tx.account_id) {
    console.log("Ignoring tx for different account:", tx.account_id);
    return Response.json({ done: true });
  }

  if (tx.event_type === "account_tx" && tx.tx_hash) {
    console.log("Getting transaction");
    const fullTransaction = await ta.blockchain.getBlockchainTransaction(
      tx.tx_hash,
    );
    const txHash = tx.tx_hash;

    const comment: string = fullTransaction?.inMsg?.decodedBody.text || "";
    if (!comment) {
      console.log("No comment found in transaction");
      return Response.json({ done: true });
    }

    console.log("comment", comment);
    const order = await getOrderByComment(comment);

    if (!order) {
      console.log("No order found for comment:", comment);
      return Response.json({ done: true });
    }

    const userId = order.userId;

    const isSuccessful = fullTransaction.success;
    if (isSuccessful) {
      console.log("Transaction successful:", txHash);
    } else {
      console.log("Transaction failed:", txHash);
      return Response.json({ done: true });
    }

    await updateOrder(order.id, {
      status: "paid",
      updatedAtIso: new Date().toISOString(),
    });
    await addPaymentLog({
      amount: order.amount,
      userId,
      paymentId: order.id,
      currency: order.currency,
      amountOfHours: 0,
      type: "subscription-full-v1",
      receiptUrl: "",
      monthsCount: order.monthCount || undefined,
    });
    await sentSupportTelegramMessage({
      message: `New CRYPTO payment received monthsCount: ${order.monthCount || "unknown"}`,
      userId: userId,
    });
  }

  return Response.json({ done: true });
}

export async function GET() {
  console.log("GET /api/crypto/webhook");
  return Response.json({ done: true, method: "GET" });
}
