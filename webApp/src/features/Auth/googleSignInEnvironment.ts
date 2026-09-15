import { shouldShowWebViewWall } from './useIsWebView';

export const isSafariUserAgent = (ua: string): boolean => /^((?!chrome|android).)*safari/i.test(ua);

export const isMobileUserAgent = (
  ua: string,
  maxTouchPoints = 0,
  coarsePointer = false,
): boolean => {
  if (/iPhone|iPad|iPod|Android/i.test(ua)) {
    return true;
  }

  return maxTouchPoints > 1 && coarsePointer;
};

/** Redirect is reliable on Safari and mobile; Firebase popups often lose the pending promise. */
export const shouldUseRedirectSignIn = (input?: {
  ua?: string;
  maxTouchPoints?: number;
  coarsePointer?: boolean;
  isWebView?: boolean;
}): boolean => {
  if (typeof window === 'undefined' && !input) {
    return false;
  }

  const ua = input?.ua ?? navigator.userAgent;
  const isWebView = input?.isWebView ?? shouldShowWebViewWall();
  if (isWebView) {
    return false;
  }

  const maxTouchPoints =
    input?.maxTouchPoints ?? (typeof navigator !== 'undefined' ? navigator.maxTouchPoints : 0) ?? 0;
  const coarsePointer =
    input?.coarsePointer ??
    (typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(pointer: coarse)').matches
      : false);

  return isMobileUserAgent(ua, maxTouchPoints, coarsePointer) || isSafariUserAgent(ua);
};
