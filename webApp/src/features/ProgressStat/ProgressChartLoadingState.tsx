'use client';

import Skeleton from '@mui/material/Skeleton';

interface ProgressChartLoadingStateProps {
  height: number;
}

export const ProgressChartLoadingState = ({ height }: ProgressChartLoadingStateProps) => {
  return <Skeleton variant="rounded" height={height} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />;
};
