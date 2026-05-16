'use client';

import { useLingui } from '@lingui/react';
import Stack from '@mui/material/Stack';

import { SectionHeader } from '../Dashboard/CartsHeader';
import { StoreCard } from '../uiKit/Card/StoreCard/StoreCard';
import { useSettings } from '../Settings/useSettings';

const NEWS_CARD_BG = '#1F3A5F';
const NEWS_CARD_ITEMS_BG = 'rgba(45, 45, 46, 0.8)';

export const NewsDashboardCard = () => {
  const { i18n } = useLingui();
  const settings = useSettings();

  if (settings.loading) return <></>;

  const countryName = settings.userSettings?.countryName || '';

  return (
    <Stack data-testid="news-dashboard-card" sx={{ gap: '20px' }}>
      <SectionHeader
        title={i18n._('Current Events')}
        subTitle={i18n._('AI-generated English learning content inspired by current events')}
      />

      <StoreCard
        textColor={'#fff'}
        backgroundColor={NEWS_CARD_BG}
        previewImageUrl={''}
        badge={countryName || undefined}
        label={i18n._('TODAY IN THE NEWS')}
        title={i18n._('Loading news...')}
        items={[]}
        emptyItemsStateText={i18n._('No news yet for your country today.')}
        itemsBackgroundColor={NEWS_CARD_ITEMS_BG}
        itemsViewMode={'list'}
      />
    </Stack>
  );
};
