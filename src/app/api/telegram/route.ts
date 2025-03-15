import { TelegramRequest, TelegramResponse } from "@/common/requests";
import { validateAuthToken } from "../config/firebase";
import { sentSupportTelegramMessage } from "./sendTelegramMessage";

export async function POST(request: Request) {
  const userInfo = await validateAuthToken(request);
  if (!userInfo.uid) {
    throw new Error("User is not authenticated");
  }

  const tgRequest = (await request.json()) as TelegramRequest;

  const message = `${tgRequest.message}
Email: ${tgRequest.userEmail}
LanguageCode: ${tgRequest.languageCode}`;
  await sentSupportTelegramMessage(message);

  const answer: TelegramResponse = {
    error: "",
  };

  return Response.json(answer);
}
