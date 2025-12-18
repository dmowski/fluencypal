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

  /*
  const firebaseUid = "TGm7JVYaFlYOrwQFC5wMojxn3A83";
  await sentSupportTelegramMessage({
    message: `✅ Card verified via SetupIntent for user ${firebaseUid}`,
    userId: firebaseUid,
  });
  */
  const answer: TelegramResponse = {
    error: "",
  };
  return Response.json(answer);
}
