'use client';

import { useLingui } from '@lingui/react';
import { Stack } from '@mui/material';
import { SectionHeader } from '@/features/Dashboard/CartsHeader';
import { useProgressStats } from './useProgressStats';
import { StoreCard } from '../uiKit/Card/StoreCard/StoreCard';
import { useAuth } from '../Auth/useAuth';
import { ProgressViewChart } from './ProgressViewChart';

const imageUrl =
  'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1774984465436-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png';

export const ProgressDashboardCard = () => {
  const { i18n } = useLingui();
  const { progressStats, loadingProgressStats } = useProgressStats();

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
          'Practice and watch your skills grow. Your progress is automatically tracked and visualized. 100% is a native-like proficiency level, while 0% is the beginner level of most language learners. The more you practice, the closer you get to 100%!',
        )}
        items={[]}
        itemsBackgroundColor={'rgb(150, 137, 137)'}
        itemsViewMode={'list'}
      >
        <ProgressViewChart
          progressStats={progressStats}
          loadingProgressStats={loadingProgressStats}
        />
      </StoreCard>
    </Stack>
  );
};
