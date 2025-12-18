"use client";

export const initGTag = () => {
  // Load gtag.js (Ads only)
  const script1 = document.createElement("script");
  script1.async = true;
  script1.src = "https://www.googletagmanager.com/gtag/js?id=AW-16463260124";
  document.head.appendChild(script1);

  const script2 = document.createElement("script");
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}

    gtag('js', new Date());

    // ✅ Consent Mode v2 — default denied
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500
    });

    // ✅ Google Ads only
    gtag('config', 'AW-16463260124');
  `;
  document.head.appendChild(script2);
};
