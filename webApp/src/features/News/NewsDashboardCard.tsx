'use client';

import { useLingui } from '@lingui/react';
import Stack from '@mui/material/Stack';

import { StoreCard } from '../uiKit/Card/StoreCard';

import { useNewsModal } from './useNewsModal';
import { SectionHeader } from '../Dashboard/CartsHeader';

const NEWS_PREVIEW_IMAGE =
  'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1779304066876-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png';

export const NewsDashboardCard = () => {
  const { i18n } = useLingui();
  const newsModal = useNewsModal();

  return (
    <Stack data-testid="news-dashboard-card">
      <StoreCard
        textColor={'#000'}
        backgroundColor={'rgba(227, 209, 193, 0.72)'}
        previewImageUrl={NEWS_PREVIEW_IMAGE}
        label={i18n._('Inspired by current events').toUpperCase()}
        title={i18n._('Discuss with AI')}
        items={[]}
        itemsBackgroundColor={'rgba(32, 32, 32, 0.88)'}
        onClick={() => newsModal.openFeed()}
        itemsViewMode={'list'}
      />
    </Stack>
  );
};
