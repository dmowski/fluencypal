import { TELEGRAM_MONTHLY_PRICE_START } from '@/features/Telegram/starPrices';
import { envConfig } from '../../config/envConfig';
import { addPaymentLog } from '../../payment/addPaymentLog';
import { sentSupportTelegramMessage } from '../sendTelegramMessage';

export const runtime = 'nodejs';
const BOT_TOKEN = envConfig.telegramBotKey;
const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Respond helper
async function call(method: string, payload: any) {
  return fetch(`${TG_API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function POST(req: Request) {
  const secretFromHeader = req.headers.get('x-telegram-bot-api-secret-token');
  if (secretFromHeader !== envConfig.telegramWebhookSecret) {
    return new Response('forbidden', { status: 403 });
  }

  const update = (await req.json()) as any;

  // 1) Approve pre-checkout
  if (update.pre_checkout_query) {
    const q = update.pre_checkout_query;
    console.log('Approve pre-checkout:', q);

    await call('answerPreCheckoutQuery', {
      pre_checkout_query_id: q.id,
      ok: true,
    });
    return new Response('ok');
  }

  // 2) Fulfill on successful payment
  const msg = update.message;
  if (msg?.successful_payment) {
    const sp = msg.successful_payment;

    const userId = msg.from.id;
    const firebaseUserId = `tg:${userId}`;
    const startAdded = sp.total_amount;
    const currency = sp.currency;

    const monthsCount = startAdded / TELEGRAM_MONTHLY_PRICE_START;
    console.log('PAYMENT SUCCESS | monthsCount', monthsCount);
    await addPaymentLog({
      amount: startAdded,
      userId: firebaseUserId,
      paymentId: sp.telegram_payment_charge_id,
      currency,
      amountOfHours: 0,
      type: 'subscription-full-v1',
      receiptUrl: '',
      monthsCount: monthsCount,
    });

    await call('sendMessage', {
      chat_id: msg.chat.id,
      text: `✅ Payment received! Thanks for your purchase.`,
    });

    await sentSupportTelegramMessage({
      message: `New payment received monthsCount: ${monthsCount}`,
      userId: firebaseUserId,
    });

    return new Response('ok');
  }

  return new Response('ok');
}

export async function GET() {
  return new Response('Telegram webhook GET');
}
