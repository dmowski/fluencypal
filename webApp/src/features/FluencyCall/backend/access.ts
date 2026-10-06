import { getDB } from '@/app/api/config/firebase';
import { UserSettings } from '@/features/Settings/userSettings';

/** Group conversations are free. Parental consent still blocks them. */
export const hasFluencyCallAccess = async (userId: string): Promise<boolean> => {
  const userSnap = await getDB().collection('users').doc(userId).get();
  const settings = userSnap.data() as UserSettings | undefined;
  return !settings?.isParentalConsentNeeded;
};
