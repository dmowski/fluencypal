'use client';

import { useLingui } from '@lingui/react';
import { Button, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { SectionHeader } from '@/features/Dashboard/CartsHeader';
import { ProgressChart } from './ProgressChart';
import { mockProgressStats } from './mockData';
import { useProgressAggregation } from './useProgressAggregation';
import { useProgressStats } from './useProgressStats';
import { ProgressChartStatus, ProgressMetric, ProgressValueMode } from './types';
import { useMemo, useState } from 'react';
import { StoreCard } from '../uiKit/Card/StoreCard/StoreCard';

const imageUrl =
  'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1774984465436-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png';

export const ProgressCard = () => {
  const { i18n } = useLingui();
  const [metric, setMetric] = useState<ProgressMetric>('grammar');
  const [valueMode, setValueMode] = useState<ProgressValueMode>('smoothed');

  const { progressStats, loadingProgressStats } = useProgressStats();
  const firestoreChartData = useProgressAggregation(progressStats);
  const mockChartData = useProgressAggregation(mockProgressStats);

  const isMocked = true;
  const isLocked = false;
  const chartData = isMocked ? mockChartData : firestoreChartData;

  const status = useMemo<ProgressChartStatus>(() => {
    if (isLocked) {
      return 'locked';
    }

    if (!isMocked && loadingProgressStats) {
      return 'loading';
    }

    return chartData.length === 0 ? 'empty' : 'ready';
  }, [chartData.length, loadingProgressStats, isLocked, isMocked]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Stack
      sx={{
        gap: '20px',
      }}
    >
      <SectionHeader
        title={i18n._('Progress')}
        subTitle={i18n._('Track how your grammar, vocabulary, fluency, and confidence improve.')}
      />

      <StoreCard
        textColor={'#fff'}
        backgroundColor={'rgba(25, 25, 25, 0.92)'}
        previewImageUrl={imageUrl}
        title={i18n._('See how you improve over time.')}
        subTitle={i18n._(
          'Practice in the app and watch your skills grow. Your progress is automatically tracked and visualized in easy-to-understand charts.',
        )}
        items={[]}
        itemsBackgroundColor={'rgb(150, 137, 137)'}
        itemsViewMode={'list'}
      >
        <Stack
          sx={{
            padding: '30px 30px 20px 0px',
          }}
        >
          <Stack
            sx={{
              width: '100%',
              padding: '0 0 45px 25px',
              flexDirection: 'row',
              gap: '10px',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
            }}
          >
            <Stack
              sx={{
                flexDirection: 'row',
                gap: '8px',
                alignItems: 'flex-end',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                }}
              >
                60%
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(243,246,255,0.72)',
                  paddingBottom: '4px',
                }}
              >
                Average Level
              </Typography>
            </Stack>

            <Stack>
              <Button
                id="basic-button"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
              >
                Dashboard
              </Button>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                  list: {
                    'aria-labelledby': 'basic-button',
                  },
                }}
              >
                <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleClose}>My account</MenuItem>
                <MenuItem onClick={handleClose}>Logout</MenuItem>
              </Menu>
            </Stack>
          </Stack>
          <ProgressChart
            data={chartData}
            metric={metric}
            valueMode={valueMode}
            status={status}
            height={320}
            emptyPreviewData={mockChartData}
          />
        </Stack>
      </StoreCard>
    </Stack>
  );
};
