import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';

export const GamePointRow = ({ points, isTop }: { points: number; isTop: boolean }) => {
  const [zoomIn, setZoomIn] = useState(false);
  const [internalPoints, setInternalPoints] = useState(points);

  useEffect(() => {
    if (internalPoints === points) return;
    setInternalPoints(points);

    setZoomIn(true);
    const timeout = setTimeout(() => {
      setZoomIn(false);
    }, 900);
    return () => clearTimeout(timeout);
  }, [points]);

  return (
    <Typography
      variant="body2"
      align="right"
      sx={{
        fontWeight: 600,
        width: 'max-content',
        color: zoomIn
          ? 'rgba(255, 114, 107, 1)'
          : isTop
            ? 'rgba(112, 191, 255, 1)'
            : 'rgba(255, 255, 255, 1)',
        fontSize: isTop ? '1.5rem' : '0.9rem',
        fontVariantNumeric: 'tabular-nums',
        transform: zoomIn ? 'scale(1.8)' : 'scale(1)',
        transition: 'all 0.5s ease-in-out',
      }}
    >
      {internalPoints}
    </Typography>
  );
};
