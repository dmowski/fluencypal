const isTelegramBotTest = process.env.TELEGRAM_BOT_IS_TEST === "true";

const prodTelegramBotKey = process.env.TELEGRAM_BOT_TOKEN || "";
const testTelegramBotKey = process.env.TELEGRAM_BOT_TOKEN_TEST || "";

export const envConfig = {
  isTelegramTestMode: isTelegramBotTest,
  telegramBotKey: isTelegramBotTest ? testTelegramBotKey : prodTelegramBotKey,
  telegramWebhookSecret: process.env.TELEGRAM_BOT_WEBHOOK_SECRET || "",
};
