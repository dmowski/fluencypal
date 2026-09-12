'use client';

import { useEffect } from 'react';
import { useCookieConsent } from '@/features/Legal/cookieConsent';
import { applyGoogleAdsConsent, initGoogleAds } from './googleAds';

export function GoogleAdsHost() {
  const consent = useCookieConsent();

  useEffect(() => {
    if (consent === undefined) return;
    initGoogleAds();
    applyGoogleAdsConsent(consent);
  }, [consent]);

  return null;
}
