'use client';

import * as Sentry from '@sentry/nextjs';
import { isDev } from './isDev';

const ACTIVATED_KEY = 'fp_analytics_user_activated_v1';

export const activateAnalyticUser = () => {
  try {
    if (typeof window === 'undefined') return;

    if (localStorage.getItem(ACTIVATED_KEY)) return;
    localStorage.setItem(ACTIVATED_KEY, '1');

    if (isDev()) {
      console.log('[activateAnalyticUser][dev]');
      return;
    }

    if (!window.gtag) {
      console.warn('gtag not available, activation skipped');
      return;
    }

    window.gtag('event', 'user_activated');
  } catch (error) {
    console.error('activateAnalyticUser error:', error);
    Sentry.captureException(error);
  }
};
