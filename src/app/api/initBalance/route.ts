import { InitBalanceResponse } from "@/common/requests";
import { getDB, validateAuthToken } from "../config/firebase";
import { WELCOME_BONUS } from "@/common/usage";
import { addPaymentLog } from "../payment/addPaymentLog";

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

  await addPaymentLog(WELCOME_BONUS, userInfo.uid, "welcome");

  const response: InitBalanceResponse = {
    done: true,
  };

  return Response.json(response);
}
