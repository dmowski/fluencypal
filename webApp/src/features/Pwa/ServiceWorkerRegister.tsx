'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker that provides offline support.
 * In development we proactively unregister any existing SW to avoid stale
 * caches interfering with hot reload.
 */
export const ServiceWorkerRegister = (): null => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const isProd = process.env.NODE_ENV === 'production';

    if (!isProd) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      return;
    }

    const register = () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
        /* swallow: offline support is best-effort */
      });
    };

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
    }
  }, []);

  return null;
};
