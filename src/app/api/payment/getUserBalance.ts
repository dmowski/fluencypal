import { getDB } from "../config/firebase";

export const getUserBalance = async (userId: string) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  const db = getDB();
  const doc = await db.collection("users").doc(userId).collection("usage").doc("totalUsage").get();
  const balance: number = doc.data()?.balance || 0;
  const usedBalance: number = doc.data()?.usedBalance || 0;
  return { balance, usedBalance };
};
