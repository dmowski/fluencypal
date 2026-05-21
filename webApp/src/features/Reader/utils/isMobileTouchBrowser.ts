const MOBILE_LAYOUT_WIDTH_THRESHOLD = 1024;

export const isMobileTouchBrowser = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const hasTouch = window.navigator.maxTouchPoints > 0;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const isMobileLikeViewport = window.innerWidth <= MOBILE_LAYOUT_WIDTH_THRESHOLD;

  return isMobileLikeViewport && (hasTouch || isCoarsePointer);
};
