import { useEffect, useRef, useState } from 'react';

const SHOW_THRESHOLD = 30;
const NAVIGATE_THRESHOLD = 60;
const MAX_MOBILE_WIDTH = 900;

export type SwipeDirection = 'next' | 'previous' | null;

/**
 * Detects vertical touch swipes on the window and exposes a swipe direction
 * indicator. Only active when `window.innerWidth < 900`. Calls onNext/onPrevious
 * on touchend when the swipe delta exceeds the navigate threshold.
 */
export const useSwipePageNavigation = ({
  onNext,
  onPrevious,
  isFirstPage,
  isLastPage,
}: {
  onNext: () => void;
  onPrevious: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
}) => {
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>(null);

  const startYRef = useRef<number | null>(null);
  const deltaRef = useRef<number>(0);

  // Use refs so the stable effect always sees fresh values without re-attaching listeners
  const onNextRef = useRef(onNext);
  const onPreviousRef = useRef(onPrevious);
  const isFirstPageRef = useRef(isFirstPage);
  const isLastPageRef = useRef(isLastPage);

  onNextRef.current = onNext;
  onPreviousRef.current = onPrevious;
  isFirstPageRef.current = isFirstPage;
  isLastPageRef.current = isLastPage;

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.innerWidth >= MAX_MOBILE_WIDTH) return;
      startYRef.current = e.touches[0].clientY;
      deltaRef.current = 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (window.innerWidth >= MAX_MOBILE_WIDTH) return;
      if (startYRef.current === null) return;

      // positive delta = finger swiped up = next page
      const delta = startYRef.current - e.touches[0].clientY;
      deltaRef.current = delta;

      if (delta > SHOW_THRESHOLD && !isLastPageRef.current) {
        setSwipeDirection('next');
      } else if (delta < -SHOW_THRESHOLD && !isFirstPageRef.current) {
        setSwipeDirection('previous');
      } else {
        setSwipeDirection(null);
      }
    };

    const handleTouchEnd = () => {
      const delta = deltaRef.current;
      if (delta >= NAVIGATE_THRESHOLD && !isLastPageRef.current) {
        onNextRef.current();
      } else if (delta <= -NAVIGATE_THRESHOLD && !isFirstPageRef.current) {
        onPreviousRef.current();
      }
      startYRef.current = null;
      deltaRef.current = 0;
      setSwipeDirection(null);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return { swipeDirection };
};
