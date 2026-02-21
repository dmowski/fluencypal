const isTelegramBotTest = process.env.TELEGRAM_BOT_IS_TEST === 'true';

const prodTelegramBotKey = process.env.TELEGRAM_BOT_TOKEN || '';
const testTelegramBotKey = process.env.TELEGRAM_BOT_TOKEN_TEST || '';
const TONAPI_KEY = process.env.TONAPI_KEY || '';
const MERCHANT_TON_ADDRESS_HASH = process.env.MERCHANT_TON_ADDRESS_HASH || '';

export const envConfig = {
  isTelegramTestMode: isTelegramBotTest,
  telegramBotKey: isTelegramBotTest ? testTelegramBotKey : prodTelegramBotKey,
  telegramWebhookSecret: process.env.TELEGRAM_BOT_WEBHOOK_SECRET || '',
  merchantTonAddress: process.env.MERCHANT_TON_ADDRESS || '',
  merchantTonAddressHash: MERCHANT_TON_ADDRESS_HASH,
  tonApiKey: TONAPI_KEY,
};
