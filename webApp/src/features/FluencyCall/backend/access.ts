import { getDB } from '@/app/api/config/firebase';
import { getUserBalance } from '@/app/api/payment/getUserBalance';
import { UserSettings } from '@/features/Settings/userSettings';
import { isFluencyCallPassActive } from '../pricing';
import { fluencyCallAccountRef } from './paths';

/** Full access, a current top-5 game win, or an active $2 month pass. */
export const hasFluencyCallAccess = async (userId: string): Promise<boolean> => {
  const userSnap = await getDB().collection('users').doc(userId).get();
  const settings = userSnap.data() as UserSettings | undefined;
  if (settings?.isParentalConsentNeeded) return false;

  const balance = await getUserBalance(userId);
  if (balance.isFullAccess) return true;

  const accountSnap = await fluencyCallAccountRef(userId).get();
  const activeUntilIso = accountSnap.data()?.activeUntilIso as string | null | undefined;
  return isFluencyCallPassActive(activeUntilIso, new Date());
};
