import { InitBalanceResponse } from "@/common/requests";
import { getDB, validateAuthToken } from "../config/firebase";
import { WELCOME_BONUS, WELCOME_BONUS_DAYS } from "@/common/usage";
import { addPaymentLog } from "../payment/addPaymentLog";
import { sentSupportTelegramMessage } from "../telegram/sendTelegramMessage";

const ENABLE_SUBSCRIPTIONS = false;
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
    type: "welcome",
    amount: WELCOME_BONUS,
    userId: userInfo.uid,

    currency: "usd",
    amountOfHours: 1,
    paymentId: "welcome",
  });

  if (ENABLE_SUBSCRIPTIONS) {
    await addPaymentLog({
      type: "trial-days",
      amount: WELCOME_BONUS,
      userId: userInfo.uid,
      currency: "usd",
      amountOfHours: 0,
      paymentId: "trial-days",
      daysCount: WELCOME_BONUS_DAYS,
    });
  }

  const response: InitBalanceResponse = {
    done: true,
  };

  const devEmails = ["dmowski.alex@gmail.com"];
  const isDev = devEmails.includes(userInfo?.email || "");
  if (!isDev) {
    const userId = userInfo.uid;
    const firebaseUrl = `https://console.firebase.google.com/u/0/project/dark-lang/firestore/databases/-default-/data/~2Fusers~2F${userId}`;
    sentSupportTelegramMessage(`New user: ${userInfo.email}

[🔥 Firebase 🔥](${firebaseUrl})
`);
  }

  return Response.json(response);
}
