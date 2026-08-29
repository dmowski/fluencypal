'use client';

import { useEffect, useState, type RefObject } from 'react';
import { LinearProgress, Stack } from '@mui/material';
import { findScrollParent } from './findScrollParent';

export const LessonScrollProgress = ({
  anchorRef,
}: {
  anchorRef: RefObject<HTMLElement | null>;
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const scrollEl = findScrollParent(anchorRef.current);
    if (!scrollEl) return;

    const update = () => {
      const max = scrollEl.scrollHeight - scrollEl.clientHeight;
      setProgress(max <= 0 ? 1 : Math.min(1, scrollEl.scrollTop / max));
    };

    update();
    scrollEl.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      scrollEl.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [anchorRef]);

  return (
    <Stack
      data-testid="interactive-lesson-scroll-progress"
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 20,
      }}
    >
      <LinearProgress
        variant="determinate"
        value={progress * 100}
        color="info"
        sx={{ height: '4px' }}
      />
    </Stack>
  );
};
