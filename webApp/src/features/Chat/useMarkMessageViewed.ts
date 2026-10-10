import { RefObject, useEffect, useRef } from 'react';
import { isActiveBrowserTab } from '@/libs/isActiveBrowserTab';

export const MESSAGE_VIEW_DWELL_MS = 1000;

export const useMarkMessageViewed = (
  elementRef: RefObject<HTMLElement | null>,
  messageId: string,
  userId: string | null | undefined,
  onView: () => void,
) => {
  const onViewRef = useRef(onView);
  onViewRef.current = onView;

  useEffect(() => {
    const element = elementRef.current;
    if (!messageId || !userId || !element) return;

    let dwellTimer: ReturnType<typeof setTimeout> | null = null;
    let hasViewed = false;
    let isInViewport = false;

    const clearDwell = () => {
      if (dwellTimer === null) return;
      clearTimeout(dwellTimer);
      dwellTimer = null;
    };

    const tryStartDwell = () => {
      if (hasViewed || dwellTimer !== null) return;
      if (!isInViewport || !isActiveBrowserTab()) return;
      dwellTimer = setTimeout(() => {
        dwellTimer = null;
        if (hasViewed || !isInViewport || !isActiveBrowserTab()) return;
        hasViewed = true;
        onViewRef.current();
      }, MESSAGE_VIEW_DWELL_MS);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      isInViewport = entry.isIntersecting;
      if (isInViewport) tryStartDwell();
      else clearDwell();
    });

    const refreshViewport = () => {
      observer.unobserve(element);
      observer.observe(element);
    };

    observer.observe(element);

    const onVisibilityChange = () => {
      if (!isActiveBrowserTab()) {
        clearDwell();
        return;
      }
      tryStartDwell();
      refreshViewport();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearDwell();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [elementRef, messageId, userId]);
};
