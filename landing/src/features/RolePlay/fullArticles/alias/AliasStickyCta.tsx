'use client';

import { Stack, useMediaQuery, useTheme } from '@mui/material';
import { RefObject, useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AliasCtaButton } from './AliasCtaButton';

interface AliasStickyCtaProps {
  sentinelRef: RefObject<HTMLElement | null>;
  practiceUrl: string;
  label: string;
}

export const AliasStickyCta = ({ sentinelRef, practiceUrl, label }: AliasStickyCtaProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const updateVisibility = useCallback(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const rect = sentinel.getBoundingClientRect();
    setIsVisible(rect.bottom <= 0);
  }, [sentinelRef]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setIsVisible(false);
      return;
    }

    updateVisibility();

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      () => {
        updateVisibility();
      },
      { threshold: [0, 1] },
    );

    observer.observe(sentinel);
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateVisibility);
      window.removeEventListener('resize', updateVisibility);
    };
  }, [isMobile, sentinelRef, updateVisibility]);

  if (!isMounted || !isMobile || !isVisible) return null;

  return createPortal(
    <Stack
      component="nav"
      aria-label="Quick start Alias game"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.modal + 2,
        padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        backdropFilter: 'blur(8px)',
        alignItems: 'center',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)',
      }}
    >
      <AliasCtaButton href={practiceUrl} placement="sticky" fullWidth>
        {label}
      </AliasCtaButton>
    </Stack>,
    document.body,
  );
};
