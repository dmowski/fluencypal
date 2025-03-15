import { getDB } from "../config/firebase";
import { getUserBalance } from "./getUserBalance";

export const addToTotalBalance = async (userId: string, amountToAdd: number) => {
  const { balance, usedBalance } = await getUserBalance(userId);
  const newBalance = balance + amountToAdd;

  const db = getDB();

  const newUsedBalance = amountToAdd < 0 ? usedBalance + Math.abs(amountToAdd) : usedBalance;

  await db.collection("users").doc(userId).collection("usage").doc("totalUsage").set(
    {
      balance: newBalance,
      usedBalance: newUsedBalance,
      lastUpdatedAt: Date.now(),
    },
    { merge: true }
  );
};
