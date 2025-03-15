import { AudioUsageLog } from "@/common/usage";
import { addToTotalBalance } from "./addToTotalBalance";
import { getDB } from "../config/firebase";

export const addUsage = async (userId: string, usage: AudioUsageLog) => {
  await addToTotalBalance(userId, -usage.price);

  const db = getDB();
  const docRef = db.collection(`users/${userId}/usageLogs`).doc(usage.usageId);
  await docRef.set(usage);
};
