import { TotalUsageInfo } from "@/common/usage";
import { getDB } from "../config/firebase";
import { isUserIsGameWinner } from "../../../features/Game/api/statsResources";

export const getUserBalance = async (userId: string) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  const db = getDB();
  const isGameWinnerRequest = isUserIsGameWinner(userId);
  const doc = await db.collection("users").doc(userId).collection("usage").doc("totalUsage").get();
  const totalUsageData = doc.data() as TotalUsageInfo | undefined;
  const balanceHours: number = totalUsageData?.balanceHours || 0;
  const usedBalanceHours: number = totalUsageData?.usedHours || 0;
  const isGameWinner = await isGameWinnerRequest;

  return {
    balanceHours,
    usedBalanceHours,
    isGameWinner,
  };
};
