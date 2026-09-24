import { useEffect, useRef } from 'react';
import { useAuth } from '@/features/Auth/useAuth';
import { useSettings } from '@/features/Settings/useSettings';
import { useCurrency } from '@/features/User/useCurrency';
import { consumeDayPassCheckout, startDayPassCheckout } from './dayPassCheckout';

export const useResumeDayPassCheckout = (): void => {
  const auth = useAuth();
  const settings = useSettings();
  const currency = useCurrency();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current || auth.loading || !auth.isIdentified || !auth.uid) return;
    if (!consumeDayPassCheckout()) return;
    startedRef.current = true;

    void (async () => {
      const token = await auth.getToken();
      const sessionUrl = await startDayPassCheckout({
        userId: auth.uid,
        token,
        languageCode: settings.pageLanguageCode,
        currency: currency.currency,
        email: auth.userInfo?.email,
      });
      if (sessionUrl) {
        window.location.assign(sessionUrl);
      }
    })();
  }, [
    auth,
    auth.loading,
    auth.isIdentified,
    auth.uid,
    auth.userInfo?.email,
    currency.currency,
    settings.pageLanguageCode,
  ]);
};
