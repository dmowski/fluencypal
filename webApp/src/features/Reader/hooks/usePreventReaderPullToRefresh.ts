import { useEffect } from 'react';
import { isMobileTouchBrowser } from '../utils/isMobileTouchBrowser';

type LockedDocumentStyles = {
  htmlOverscroll: string;
  bodyOverscroll: string;
  bodyOverflow: string;
  bodyPosition: string;
  bodyWidth: string;
  bodyTop: string;
  bodyLeft: string;
};

const lockDocumentScroll = (): { scrollY: number; previous: LockedDocumentStyles } => {
  const { documentElement: html, body } = document;
  const scrollY = window.scrollY;

  const previous: LockedDocumentStyles = {
    htmlOverscroll: html.style.overscrollBehaviorY,
    bodyOverscroll: body.style.overscrollBehaviorY,
    bodyOverflow: body.style.overflow,
    bodyPosition: body.style.position,
    bodyWidth: body.style.width,
    bodyTop: body.style.top,
    bodyLeft: body.style.left,
  };

  html.style.overscrollBehaviorY = 'none';
  body.style.overscrollBehaviorY = 'none';
  body.style.overflow = 'hidden';
  body.style.position = 'fixed';
  body.style.width = '100%';
  body.style.left = '0';
  body.style.top = `-${scrollY}px`;

  return { scrollY, previous };
};

const unlockDocumentScroll = ({
  scrollY,
  previous,
}: {
  scrollY: number;
  previous: LockedDocumentStyles;
}) => {
  const { documentElement: html, body } = document;

  html.style.overscrollBehaviorY = previous.htmlOverscroll;
  body.style.overscrollBehaviorY = previous.bodyOverscroll;
  body.style.overflow = previous.bodyOverflow;
  body.style.position = previous.bodyPosition;
  body.style.width = previous.bodyWidth;
  body.style.top = previous.bodyTop;
  body.style.left = previous.bodyLeft;
  window.scrollTo(0, scrollY);
};

/**
 * Prevents mobile pull-to-refresh / vertical overscroll reload gestures while
 * an active reader page is open in a touch mobile browser.
 */
export const usePreventReaderPullToRefresh = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled || !isMobileTouchBrowser()) {
      return;
    }

    const lock = lockDocumentScroll();

    return () => {
      unlockDocumentScroll(lock);
    };
  }, [enabled]);
};
