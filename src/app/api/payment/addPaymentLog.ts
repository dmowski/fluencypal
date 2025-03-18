import { PaymentLog, PaymentLogType } from "@/common/usage";
import { getDB } from "../config/firebase";
import { addToTotalBalance } from "./addToTotalBalance";

export const addPaymentLog = async (
  amount: number,
  userId: string,
  paymentId: string,
  currency: string,
  type?: PaymentLogType
) => {
  const paymentLog: PaymentLog = {
    id: paymentId,
    amountAdded: amount,
    createdAt: Date.now(),
    type: type || "user",
    currency,
  };

  const db = getDB();

  await db
    .collection("users")
    .doc(userId)
    .collection("payments")
    .doc(paymentLog.id)
    .set(paymentLog);

  await addToTotalBalance(userId, amount);
};
