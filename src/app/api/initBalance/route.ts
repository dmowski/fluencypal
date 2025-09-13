import { InitBalanceResponse } from "@/common/requests";
import { getDB, validateAuthToken } from "../config/firebase";
import { WELCOME_BONUS } from "@/common/usage";
import { addPaymentLog } from "../payment/addPaymentLog";
import { sentSupportTelegramMessage } from "../telegram/sendTelegramMessage";
import { TRIAL_DAYS } from "@/common/subscription";

const ENABLE_SUBSCRIPTIONS = true;
export async function POST(request: Request) {
  const userInfo = await validateAuthToken(request);
  const response: InitBalanceResponse = {
    done: true,
  };

  const userId = userInfo.uid;
  const db = getDB();

  const [logsHours, logsDays] = await Promise.all([
    db.collection("users").doc(userId).collection("payments").where("type", "==", "welcome").get(),
    db
      .collection("users")
      .doc(userId)
      .collection("payments")
      .where("type", "==", "trial-days")
      .get(),
  ]);

  console.log("logsDays.docs", logsDays.docs);

  if (logsHours.docs.length > 0) {
    return Response.json(response);
  }

  if (logsDays.docs.length > 0) {
    return Response.json(response);
  }

  if (ENABLE_SUBSCRIPTIONS) {
    await addPaymentLog({
      type: "trial-days",
      amount: WELCOME_BONUS,
      userId: userInfo.uid,
      currency: "usd",
      amountOfHours: 0,
      paymentId: "trial-days",
      daysCount: TRIAL_DAYS,
    });
  } else {
    await addPaymentLog({
      type: "welcome",
      amount: WELCOME_BONUS,
      userId: userInfo.uid,

      currency: "usd",
      amountOfHours: 1,
      paymentId: "welcome",
    });
  }

  const devEmails = ["dmowski.alex@gmail.com"];
  const isDev = devEmails.includes(userInfo?.email || "");
  if (!isDev) {
    const userId = userInfo.uid;
    sentSupportTelegramMessage({
      message: `New user`,
      userId: userId,
    });
  }

  return Response.json(response);
}
