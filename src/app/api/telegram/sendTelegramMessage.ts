const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY || "";
const TELEGRAM_SUPPORT_CHAT_ID = process.env.TELEGRAM_SUPPORT_CHAT_ID || "";

const sendTelegramMessage = async (message: string, chatId: string): Promise<void> => {
  const formattedMessage = encodeURIComponent(message.replace(/"/g, '\\"'));

  const urlForSend = [
    `https://api.telegram.org/bot${TELEGRAM_API_KEY}/`,
    `sendMessage?chat_id=${chatId}&`,
    `text=${formattedMessage}&`,
    `parse_mode=Markdown`,
  ].join("");

  try {
    const result = await fetch(urlForSend);

    const resultJson = await result.json();
    const isDebug = false;
    if (isDebug) {
      console.log("Telegram response: ", resultJson);
    }
  } catch (error) {
    console.error("Error sending message to Telegram: ", error);
  }
};

export const sentSupportTelegramMessage = async (message: string): Promise<void> => {
  if (!TELEGRAM_API_KEY || !TELEGRAM_SUPPORT_CHAT_ID) {
    throw new Error("Telegram API key or chat ID is not set");
  }
  await sendTelegramMessage(message, TELEGRAM_SUPPORT_CHAT_ID);
};
