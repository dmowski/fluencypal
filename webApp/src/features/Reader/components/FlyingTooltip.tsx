import { Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

export const FLYING_TOOLTIP_OFFSET_X = 4;
export const FLYING_TOOLTIP_OFFSET_Y = 19;

type FlyingTooltipProps = {
  text: string;
  initialPosition?: {
    x: number;
    y: number;
  } | null;
};

export const FlyingTooltip = ({ text, initialPosition = null }: FlyingTooltipProps) => {
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(
    initialPosition,
  );

  useEffect(() => {
    if (initialPosition) {
      setCursorPosition(initialPosition);
    }
  }, [initialPosition]);

  useEffect(() => {
    const handleMouseMove = (event: globalThis.MouseEvent) => {
      setCursorPosition({
        x: event.clientX + FLYING_TOOLTIP_OFFSET_X,
        y: event.clientY + FLYING_TOOLTIP_OFFSET_Y,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (!cursorPosition) {
    return null;
  }

  return (
    <Stack
      sx={{
        position: 'fixed',
        left: `${cursorPosition.x}px`,
        top: `${cursorPosition.y}px`,
        pointerEvents: 'none',
        zIndex: 1600,
        padding: '3px 6px',
        minWidth: '10px',
        maxWidth: '240px',
        borderRadius: '4px',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.18)',
        backgroundColor: '#222',
      }}
    >
      <Typography
        component={'span'}
        sx={{
          fontSize: '12px',
          fontFamily: 'sans-serif',
          lineHeight: 1.35,
          fontWeight: 400,
          color: '#fff',
        }}
      >
        {text}
      </Typography>
    </Stack>
  );
};
