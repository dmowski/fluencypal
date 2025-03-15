import { getDB } from "../config/firebase";
import { getUserBalance } from "./getUserBalance";

export const addToTotalBalance = async (userId: string, amountToAdd: number) => {
  const actualBalance = await getUserBalance(userId);
  const newBalance = actualBalance + amountToAdd;

  const db = getDB();

  await db.collection("users").doc(userId).collection("usage").doc("totalUsage").set(
    {
      balance: newBalance,
      lastUpdatedAt: Date.now(),
    },
    { merge: true }
  );
};
