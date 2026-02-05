import { TotalUsageInfo } from '@/common/usage';
import { getDB } from '../config/firebase';
import { getUserBalance } from './getUserBalance';
import dayjs from 'dayjs';

interface AddToTotalBalanceProps {
  userId: string;
  amountToAddHours: number;

  // This is not a balance in hours, but actual hours to add to . Like for trial hours
  hoursCount?: number;
  minutesCount?: number;
  monthsCount?: number;
  daysCount?: number;
}

export const addToTotalBalance = async ({
  userId,
  amountToAddHours,

  monthsCount,
  daysCount,
  hoursCount,
  minutesCount,
}: AddToTotalBalanceProps) => {
  const db = getDB();
  const balance = await getUserBalance(userId);
  const newTotalUsage: Partial<TotalUsageInfo> = {
    lastUpdatedAt: Date.now(),
  };

  if (
    monthsCount !== undefined ||
    daysCount !== undefined ||
    hoursCount !== undefined ||
    minutesCount !== undefined
  ) {
    const isActiveSubscriptions = !!balance.activeSubscriptionTill;
    const lastDate = isActiveSubscriptions ? dayjs(balance.activeSubscriptionTill) : dayjs();

    const endDate = monthsCount
      ? lastDate.add(monthsCount, 'month')
      : hoursCount
        ? lastDate.add(hoursCount, 'hour')
        : minutesCount
          ? lastDate.add(minutesCount, 'minute')
          : lastDate.add(daysCount || 0, 'day');
    const endDateIso = endDate.toISOString();

    console.log('endDateIso', endDateIso);
    newTotalUsage.activeSubscriptionTill = endDateIso;
  } else {
    const newBalance = Math.min(0, balance.balanceHours) + amountToAddHours;
    console.log('newBalance', newBalance);

    const newUsedBalance =
      amountToAddHours < 0
        ? balance.usedBalanceHours + Math.abs(amountToAddHours)
        : balance.usedBalanceHours;

    newTotalUsage.balanceHours = newBalance;
    newTotalUsage.usedHours = newUsedBalance;
    console.log('newTotalUsage.usedHours', newTotalUsage.usedHours);
  }

  await db
    .collection('users')
    .doc(userId)
    .collection('usage')
    .doc('totalUsage')
    .set(newTotalUsage, { merge: true });
};
