import { getFirebaseLink } from "@/features/Firebase/getFirebaseLink";
import { getUserInfo } from "../user/getUserInfo";

const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY || "";
const TELEGRAM_SUPPORT_CHAT_ID = process.env.TELEGRAM_SUPPORT_CHAT_ID || "";

const sendTelegramMessage = async (message: string, chatId: string): Promise<void> => {
  const url = new URL(`https://api.telegram.org/bot${TELEGRAM_API_KEY}/sendMessage`);
  url.searchParams.set("chat_id", chatId);
  url.searchParams.set("text", message);
  url.searchParams.set("parse_mode", "Markdown");

  try {
    console.log("urlForSend", url);
    const result = await fetch(url);
    const resultJson = await result.json();
    const isDebug = false;
    if (isDebug) {
      console.log("Telegram response: ", resultJson);
    }
  } catch (error) {
    console.error("Error sending message to Telegram: ", error);
  }
};

export const sentSupportTelegramMessage = async ({
  message,
  userId,
}: {
  message: string;
  userId?: string;
}): Promise<void> => {
  if (!TELEGRAM_API_KEY || !TELEGRAM_SUPPORT_CHAT_ID) {
    throw new Error("Telegram API key or chat ID is not set");
  }

  let postfixMessage = "";
  if (userId) {
    const firebaseLink = getFirebaseLink(userId);
    const firebaseLinkText = `[🚀Firebase Link.🚀](${firebaseLink})`;
    try {
      const userInfo = await getUserInfo(userId);
      const userEmail = userInfo?.email || "Unknown email";
      const country = userInfo.countryName;
      postfixMessage += `\n\n${userEmail} (${country})\n${firebaseLinkText}`;
    } catch (error) {
      console.error("Error fetching user info: ", error);
      postfixMessage = `\n\nUser ID: ${userId}\n${firebaseLinkText}`;
    }
  } else {
    postfixMessage = "\nUnknown user";
  }

  await sendTelegramMessage(message + postfixMessage, TELEGRAM_SUPPORT_CHAT_ID);
};
