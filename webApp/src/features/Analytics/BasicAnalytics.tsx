'use client';

import { useEffect } from 'react';
import { confirmGtag } from './confirmGtag';
import { isDev } from './isDev';
import { initGTag } from './initGTag';

export const BasicAnalytics = () => {
  useEffect(() => {
    // The first-party tracker iframe must not create a second Google tag/page view.
    if (isDev() || window.self !== window.top) return;
    initGTag();
    // Stripe returns here after a paid checkout. The pre-redirect hit can be lost.
    if (new URLSearchParams(window.location.search).get('paymentSuccess') === 'true') {
      void confirmGtag();
    }
  }, []);
  return null;
};
