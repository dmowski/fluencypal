import { PaymentLog } from "@/common/usage";
import { getDB } from "../config/firebase";
import { addToTotalBalance } from "./addToTotalBalance";

export const confirmPayment = async (amount: number, userId: string, paymentId: string) => {
  const paymentLog: PaymentLog = {
    id: paymentId,
    amountAdded: amount,
    createdAt: Date.now(),
    type: "user",
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
