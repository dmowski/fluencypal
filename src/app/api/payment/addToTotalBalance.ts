import { TotalUsageInfo } from "@/common/usage";
import { getDB } from "../config/firebase";
import { getUserBalance } from "./getUserBalance";
import dayjs from "dayjs";

interface AddToTotalBalanceProps {
  userId: string;
  amountToAddHours: number;
  monthsCount?: number;
  daysCount?: number;
}

export const addToTotalBalance = async ({
  userId,
  amountToAddHours,
  monthsCount,
  daysCount,
}: AddToTotalBalanceProps) => {
  const db = getDB();
  const balance = await getUserBalance(userId);

  const newTotalUsage: Partial<TotalUsageInfo> = {
    lastUpdatedAt: Date.now(),
  };

  if (monthsCount || daysCount) {
    const isActiveSubscriptions = !!balance.activeSubscriptionTill;

    const lastDate = isActiveSubscriptions ? dayjs(balance.activeSubscriptionTill) : dayjs();

    const endDate = monthsCount
      ? lastDate.add(monthsCount, "month")
      : lastDate.add(daysCount || 1, "day");
    const endDateIso = endDate.format("YYYY-MM-DD");
    newTotalUsage.activeSubscriptionTill = endDateIso;
  } else {
    const newBalance = balance.balanceHours + amountToAddHours;

    const newUsedBalance =
      amountToAddHours < 0
        ? balance.usedBalanceHours + Math.abs(amountToAddHours)
        : balance.usedBalanceHours;

    newTotalUsage.balanceHours = newBalance;
    newTotalUsage.usedHours = newUsedBalance;
  }

  await db
    .collection("users")
    .doc(userId)
    .collection("usage")
    .doc("totalUsage")
    .set(newTotalUsage, { merge: true });
};
