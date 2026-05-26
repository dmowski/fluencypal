'use client';

import Script from 'next/script';

export const AnalyticsBookScript = () => {
  if (typeof window === 'undefined' || window.location.hostname !== 'book.fluencypal.com') {
    return null;
  }

  return (
    <Script
      src="https://cloud.umami.is/script.js"
      data-website-id="e54b6925-d2d8-4569-9594-101c6af33562"
      strategy="afterInteractive"
    />
  );
};
