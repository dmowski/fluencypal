import { TelegramRequest, TelegramResponse } from "@/common/requests";
import { validateAuthToken } from "../config/firebase";
import { sentSupportTelegramMessage } from "./sendTelegramMessage";

export async function POST(request: Request) {
  const userInfo = await validateAuthToken(request);
  if (!userInfo.uid) {
    throw new Error("User is not authenticated");
  }

  const email = userInfo.email;
  const userId = userInfo.uid;
  const firebaseUrl = `https://console.firebase.google.com/u/0/project/dark-lang/firestore/databases/-default-/data/~2Fusers~2F${userId}`;

  const tgRequest = (await request.json()) as TelegramRequest;

  const message = `${tgRequest.message} : ${email}
[🔥 Firebase 🔥](${firebaseUrl})
`;
  await sentSupportTelegramMessage(message);

  const answer: TelegramResponse = {
    error: "",
  };

  return Response.json(answer);
}
