import { useEffect } from 'react';
import { isOnlyProfilePageOpen } from './isOnlyProfilePageOpen';

export function useEscapeHomeFromProfile(goHome: () => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (!isOnlyProfilePageOpen(window.location.search)) return;
      event.preventDefault();
      goHome();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goHome]);
}
