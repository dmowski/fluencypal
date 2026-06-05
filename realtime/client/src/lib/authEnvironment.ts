/** Browser / device signals for choosing Google sign-in strategy. */

export const isSafari = (): boolean =>
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

export const isMobileDevice = (): boolean => {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod|Android/i.test(ua)) {
    return true;
  }

  return navigator.maxTouchPoints > 1 && window.matchMedia('(pointer: coarse)').matches;
};

/** Instagram, Facebook, Telegram, etc. — Google OAuth usually fails here. */
export const isInAppBrowser = (): boolean => {
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.includes('instagram') ||
    ua.includes('fban') ||
    ua.includes('fbav') ||
    ua.includes('fb_iab') ||
    ua.includes('linkedinapp') ||
    ua.includes('tiktok') ||
    ua.includes('bytedance') ||
    ua.includes('telegram') ||
    ua.includes('tginternal') ||
    ua.includes('tgapp') ||
    (ua.includes('android') && ua.includes(' wv'))
  );
};

/** Redirect is reliable on mobile Safari/Chrome; popups are often blocked. */
export const shouldUseRedirectSignIn = (): boolean => {
  if (isInAppBrowser()) {
    return false;
  }

  return isMobileDevice() || isSafari();
};
