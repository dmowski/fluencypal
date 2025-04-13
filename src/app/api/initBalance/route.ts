import { InitBalanceResponse } from "@/common/requests";
import { getDB, validateAuthToken } from "../config/firebase";
import { WELCOME_BONUS } from "@/common/usage";
import { addPaymentLog } from "../payment/addPaymentLog";
import { sentSupportTelegramMessage } from "../telegram/sendTelegramMessage";

export async function POST(request: Request) {
  const userInfo = await validateAuthToken(request);

  const userId = userInfo.uid;
  const db = getDB();

  const logs = await db
    .collection("users")
    .doc(userId)
    .collection("payments")
    .where("type", "==", "welcome")
    .get();

  if (!logs.empty) {
    throw new Error("Already added welcome bonus");
  }

  await addPaymentLog({
    amount: WELCOME_BONUS,
    userId: userInfo.uid,
    type: "welcome",
    currency: "usd",
    amountOfHours: 1,
    paymentId: "welcome",
  });

  const response: InitBalanceResponse = {
    done: true,
  };

  const devEmails = ["dmowski.alex@gmail.com"];
  const isDev = devEmails.includes(userInfo?.email || "");
  if (!isDev) {
    sentSupportTelegramMessage(`New user: ${userInfo.email}`);
  }

  return Response.json(response);
}
