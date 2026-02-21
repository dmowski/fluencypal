'use client';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

const GA4_ID = 'G-K2X9LZJ50W';
const ADS_ID = 'AW-16463260124';

export const initGTag = () => {
  if (typeof window === 'undefined') return;

  // Prevent double init
  if (window.gtag) return;

  // ✅ Load gtag.js (GA4 + Ads)
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script1);

  // ✅ Inline init config
  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    window.gtag = gtag;

    gtag('js', new Date());

    // ✅ Consent Mode v2 — default denied
    gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500
    });

    // ✅ Google Analytics (GA4)
    gtag('config', '${GA4_ID}');

    // ✅ Google Ads
    gtag('config', '${ADS_ID}');
  `;
  document.head.appendChild(script2);
};

export const acceptAnalytics = () => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('consent', 'update', {
    analytics_storage: 'granted',
    // keep ads denied unless user explicitly accepts marketing
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });

  // Re-configure GA4 after consent update (recommended)
  window.gtag('config', GA4_ID, {
    send_page_view: true,
  });
};
