import { PaymentLog, PaymentLogType } from "@/common/usage";
import { getDB } from "../config/firebase";
import { addToTotalBalance } from "./addToTotalBalance";
import { sentSupportTelegramMessage } from "../telegram/sendTelegramMessage";

interface AddPaymentLogParams {
  amount: number;
  userId: string;
  paymentId: string;
  currency: string;
  type: PaymentLogType;
  amountOfHours: number;
  receiptUrl?: string;
  monthsCount?: number;
  daysCount?: number;
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
  daysCount,
}: AddPaymentLogParams) => {
  const paymentLog: PaymentLog = {
    id: paymentId,
    amountAdded: amount,
    createdAt: Date.now(),
    type: type || "user",
    currency,
    amountOfHours,
    receiptUrl: receiptUrl || "",
    amountOfDays: daysCount || 0,
    amountOfMonth: monthsCount || 0,
  };

  const db = getDB();

  const isAlreadyPaid = await db
    .collection("users")
    .doc(userId)
    .collection("payments")
    .doc(paymentId)
    .get()
    .then((doc) => doc.exists);

  if (isAlreadyPaid) {
    console.log("Payment log already exists");
    await sentSupportTelegramMessage({
      message: "Payment log already exists: " + paymentId,
      userId,
    });
    return;
  }

  await db
    .collection("users")
    .doc(userId)
    .collection("payments")
    .doc(paymentLog.id)
    .set(paymentLog);

  await addToTotalBalance({
    userId,
    amountToAddHours: paymentLog.amountOfHours,
    monthsCount,
    daysCount,
  });
};
