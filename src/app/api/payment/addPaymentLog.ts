import { PaymentLog, PaymentLogType } from "@/common/usage";
import { getDB } from "../config/firebase";
import { addToTotalBalance } from "./addToTotalBalance";

interface AddPaymentLogParams {
  amount: number;
  userId: string;
  paymentId: string;
  currency: string;
  type: PaymentLogType;
  amountOfHours: number;
  receiptUrl?: string;
  monthsCount?: number;
}
export const addPaymentLog = async ({
  amount,
  userId,
  paymentId,
  currency,
  type,
  amountOfHours,
  receiptUrl,
  monthsCount,
}: AddPaymentLogParams) => {
  const paymentLog: PaymentLog = {
    id: paymentId,
    amountAdded: amount,
    createdAt: Date.now(),
    type: type || "user",
    currency,
    amountOfHours,
    receiptUrl: receiptUrl || "",
  };

  const db = getDB();

  await db
    .collection("users")
    .doc(userId)
    .collection("payments")
    .doc(paymentLog.id)
    .set(paymentLog);

  await addToTotalBalance({ userId, amountToAddHours: paymentLog.amountOfHours, monthsCount });
};
