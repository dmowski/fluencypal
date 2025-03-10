import { PaymentLog } from "@/common/usage";
import { getDB } from "../config/firebase";

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

  try {
    const actualBalanceDoc = await db
      .collection("users")
      .doc(userId)
      .collection("usage")
      .doc("totalUsage")
      .get();
    const actualBalance: number = actualBalanceDoc.data()?.balance || 0;
    console.log("actualBalance", actualBalance);

    await db
      .collection("users")
      .doc(userId)
      .collection("usage")
      .doc("totalUsage")
      .set(
        {
          balance: actualBalance + amount,
          lastUpdatedAt: Date.now(),
        },
        { merge: true }
      );
  } catch (e) {
    console.log("Error updating balance", e);
  }
};
