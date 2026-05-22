import type { MobilePlatform } from './types';

const MOBILE_LAYOUT_WIDTH_THRESHOLD = 1024;

export const isLocalhostHostname = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.location.hostname === 'localhost';
};

export const isPwaInstalled = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const isStandaloneDisplay = window.matchMedia('(display-mode: standalone)').matches;
  const isIosStandalone = window.navigator.standalone === true;

  return isStandaloneDisplay || isIosStandalone;
};

export const isMobileInstallTarget = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const hasTouch = window.navigator.maxTouchPoints > 0;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const isMobileLikeViewport = window.innerWidth <= MOBILE_LAYOUT_WIDTH_THRESHOLD;

  return isMobileLikeViewport && (hasTouch || isCoarsePointer);
};

export const getMobilePlatform = (): MobilePlatform => {
  if (typeof window === 'undefined') {
    return 'other';
  }

  const ua = window.navigator.userAgent;
  const isIosDevice =
    /iPad|iPhone|iPod/.test(ua) ||
    (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);

  if (isIosDevice) {
    return 'ios';
  }

  if (/Android/i.test(ua)) {
    return 'android';
  }

  return 'other';
};

export const shouldShowInstallAppCard = (): boolean => {
  if (isPwaInstalled()) {
    return false;
  }

  if (isLocalhostHostname()) {
    return true;
  }

  return isMobileInstallTarget();
};
