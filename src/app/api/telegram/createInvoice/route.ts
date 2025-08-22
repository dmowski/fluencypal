import { NextRequest } from "next/server";
import { envConfig } from "../../config/envConfig";
import crypto from "node:crypto";
import { CreateTelegramInvoiceRequest, CreateTelegramInvoiceResponse } from "./types";
import { validateAuthToken } from "../../config/firebase";
import { TELEGRAM_MONTHLY_PRICE_START } from "@/features/Telegram/starPrices";

const BOT_TOKEN = envConfig.telegramBotKey;
const isTest = true;
const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}${isTest ? "/test" : ""}`;

function makeOrderPayload(uid: string, monthCount: number) {
  // Use a signed/unguessable payload so you can verify later in webhook
  const nonce = crypto.randomBytes(6).toString("hex");
  return `order:user=${uid};months=${monthCount};nonce=${nonce}`;
}

function clampMonthCount(n: number) {
  // Guardrails; change as you wish (1..12)
  if (!Number.isFinite(n)) return 1;
  return Math.min(12, Math.max(1, Math.floor(n)));
}

export async function POST(request: NextRequest) {
  // Base response we’ll always return (HTTP 200)
  const base: CreateTelegramInvoiceResponse = {
    ok: false,
    invoice_link: null,
    amount_stars: 0,
    monthCount: 0,
    payload: null,
  };

  try {
    // 1) Auth check
    const user = await validateAuthToken(request);
    if (!user?.uid) {
      const response: CreateTelegramInvoiceResponse = {
        ...base,
        error: { code: "UNAUTHORIZED", message: "User is not authenticated" },
      };
      return Response.json(response);
    }

    if (!envConfig.telegramBotKey || !TG_API) {
      const response: CreateTelegramInvoiceResponse = {
        ...base,
        error: { code: "SERVER_MISCONFIGURED", message: "TELEGRAM_BOT_TOKEN is missing" },
      };
      return Response.json(response);
    }

    // 2) Parse input
    const body = (await request.json()) as CreateTelegramInvoiceRequest;
    const monthCount = clampMonthCount(body?.monthCount);
    const amountStars = TELEGRAM_MONTHLY_PRICE_START * monthCount;

    // 3) Build invoice payload & data
    const payload = makeOrderPayload(user.uid, monthCount);

    // NOTE: For Stars, provider_token MUST be empty string, currency MUST be "XTR".
    // This creates a one-time invoice for X months. If you want subscriptions, use
    // `subscription_period: 2592000` (30d) and require monthCount === 1.
    const tgRes = await fetch(`${TG_API}/createInvoiceLink`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `FluencyPal Full Access`,
        description: `${monthCount} month${monthCount > 1 ? "s" : ""} of premium features`,
        payload, // echoed back in successful_payment
        provider_token: "", // Stars => empty
        currency: "XTR", // Stars currency
        prices: [{ label: "Access", amount: amountStars }],
        // Optional visuals:
        // photo_url: "https://your.cdn/cover.jpg",
        // Optional: if you strictly do subs and want exactly 30 days:
        // subscription_period: 2592000, // 30 days (requires XTR; typically monthCount === 1)
      }),
    });

    const data = await tgRes.json();
    console.log("Invoice data", data);

    if (!data?.ok || !data?.result) {
      const response: CreateTelegramInvoiceResponse = {
        ...base,
        amount_stars: amountStars,
        monthCount,
        payload,
        error: {
          code: "TG_API_ERROR",
          message: data?.description || "Failed to create invoice link",
        },
      };
      return Response.json(response);
    }

    // 4) Success
    const response: CreateTelegramInvoiceResponse = {
      ok: true,
      invoice_link: data.result as string,
      amount_stars: amountStars,
      monthCount,
      payload,
    };
    return Response.json(response);
  } catch (e: any) {
    // 5) Safe error
    const errorResponse: CreateTelegramInvoiceResponse = {
      ...base,
      error: { code: "SERVER_ERROR", message: e?.message || "Unexpected server error" },
    };
    return Response.json(errorResponse);
  }
}
