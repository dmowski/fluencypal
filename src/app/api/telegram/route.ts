import { TelegramRequest, TelegramResponse } from "@/common/requests";

const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY;
const TELEGRAM_SUPPORT_CHAT_ID = process.env.TELEGRAM_SUPPORT_CHAT_ID;

const sendTelegramMessage = async (message: string, chatId: string): Promise<void> => {
  const formattedMessage = encodeURIComponent(message.replace(/"/g, '\\"'));

  const urlForSend = [
    `https://api.telegram.org/bot${TELEGRAM_API_KEY}/`,
    `sendMessage?chat_id=${chatId}&`,
    `text=${formattedMessage}&`,
    `parse_mode=Markdown`,
  ].join("");

  const result = await fetch(urlForSend);
  const resultJson = await result.json();
  const isDebug = false;
  if (isDebug) {
    console.log("Telegram response: ", resultJson);
  }
};

export async function POST(request: Request) {
  if (!TELEGRAM_API_KEY || !TELEGRAM_SUPPORT_CHAT_ID) {
    throw new Error("Telegram API key or chat ID is not set");
  }
  const tgRequest = (await request.json()) as TelegramRequest;

  const message = `${tgRequest.message}
Email: ${tgRequest.userEmail}
LanguageCode: ${tgRequest.languageCode}`;
  await sendTelegramMessage(message, TELEGRAM_SUPPORT_CHAT_ID);

  const answer: TelegramResponse = {
    error: "",
  };

  return Response.json(answer);
}
