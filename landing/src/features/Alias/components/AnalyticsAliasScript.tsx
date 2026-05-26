'use client';

import Script from 'next/script';

export const AnalyticsAliasScript = () => {
  if (typeof window === 'undefined' || window.location.hostname !== 'www.fluencypal.com') {
    return null;
  }

  return (
    <Script
      src="https://cloud.umami.is/script.js"
      data-website-id="fda0acb5-b644-4e56-8d83-18389a45054e"
      strategy="afterInteractive"
    />
  );
};
