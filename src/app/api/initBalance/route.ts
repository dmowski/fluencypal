import { InitBalanceResponse } from "@/common/requests";
import { getDB, validateAuthToken } from "../config/firebase";
import { WELCOME_BONUS } from "@/common/usage";
import { addPaymentLog } from "../payment/addPaymentLog";
import { TRIAL_HOURS } from "@/common/subscription";

export async function POST(request: Request) {
  const userInfo = await validateAuthToken(request);
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

  if (logsHours.docs.length > 0 || logsDays.docs.length > 0) {
    return Response.json(response);
  }

  await addPaymentLog({
    type: "trial-days",
    amount: WELCOME_BONUS,
    userId: userInfo.uid,
    currency: "usd",
    amountOfHours: 0,
    paymentId: "trial-days",
    hoursCount: TRIAL_HOURS,
  });

  return Response.json(response);
}

const response: InitBalanceResponse = {
  done: true,
};
