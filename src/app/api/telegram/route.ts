import { TelegramRequest, TelegramResponse } from "@/common/requests";
import { validateAuthToken } from "../config/firebase";
import { sentSupportTelegramMessage } from "./sendTelegramMessage";

export async function POST(request: Request) {
  const userInfo = await validateAuthToken(request);
  if (!userInfo.uid) {
    throw new Error("User is not authenticated");
  }
  const userId = userInfo.uid;
  const tgRequest = (await request.json()) as TelegramRequest;
  const message = `${tgRequest.message}`;
  await sentSupportTelegramMessage({ message, userId });
  const answer: TelegramResponse = {
    error: "",
  };
  return Response.json(answer);
}
