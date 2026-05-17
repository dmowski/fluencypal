import { Stack } from '@mui/material';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SwipeDirection } from '../hooks/useSwipePageNavigation';

/**
 * Displays a fixed circular arrow indicator at the top or bottom of the screen
 * during a swipe-to-navigate gesture on mobile (< 900px).
 *
 * - direction === 'previous': icon at top with up arrow (scroll down → previous page)
 * - direction === 'next':     icon at bottom with down arrow (scroll up → next page)
 */
export const SwipePageIndicator = ({ direction }: { direction: SwipeDirection }) => {
  if (!direction) return null;

  const isNext = direction === 'next';

  return (
    <Stack
      data-testid="swipe-page-indicator"
      sx={{
        position: 'fixed',
        left: '50%',
        top: isNext ? 'auto' : '16px',
        bottom: isNext ? '64px' : 'auto',
        transform: 'translateX(-50%)',
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.12)',
        borderRadius: '50%',
        width: '52px',
        height: '52px',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        color: '#333',
        animation: 'swipeIndicatorIn 0.15s ease forwards',
        '@keyframes swipeIndicatorIn': {
          from: {
            opacity: 0,
            transform: isNext
              ? 'translateX(-50%) translateY(12px)'
              : 'translateX(-50%) translateY(-12px)',
          },
          to: {
            opacity: 1,
            transform: 'translateX(-50%) translateY(0)',
          },
        },
      }}
    >
      {isNext ? <ChevronDown size={28} /> : <ChevronUp size={28} />}
    </Stack>
  );
};
