import { TotalUsageInfo } from "@/common/usage";
import { getDB } from "../config/firebase";
import { getUserBalance } from "./getUserBalance";

interface AddToTotalBalanceProps {
  userId: string;
  amountToAddHours: number;
}

export const addToTotalBalance = async ({ userId, amountToAddHours }: AddToTotalBalanceProps) => {
  const balance = await getUserBalance(userId);
  const newBalance = balance.balanceHours + amountToAddHours;

  const db = getDB();

  const newUsedBalance =
    amountToAddHours < 0
      ? balance.usedBalanceHours + Math.abs(amountToAddHours)
      : balance.usedBalanceHours;

  const newTotalUsage: Partial<TotalUsageInfo> = {
    balanceHours: newBalance,
    usedHours: newUsedBalance,
    lastUpdatedAt: Date.now(),
  };

  await db
    .collection("users")
    .doc(userId)
    .collection("usage")
    .doc("totalUsage")
    .set(newTotalUsage, { merge: true });
};
