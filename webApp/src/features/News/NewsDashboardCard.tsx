'use client';

import { useLingui } from '@lingui/react';
import Stack from '@mui/material/Stack';

import { SectionHeader } from '../Dashboard/CartsHeader';
import { StoreCard } from '../uiKit/Card/StoreCard/StoreCard';
import type { CardItem } from '../uiKit/Card/StoreCard/types';
import { useSettings } from '../Settings/useSettings';

import { useNews } from './useNews';
import type { NewsItemSummary } from './types';

const NEWS_CARD_BG = '#1F3A5F';
const NEWS_CARD_ITEMS_BG = 'rgba(45, 45, 46, 0.8)';

/**
 * Colors cycled across the 3 news rows; kept short so the palette stays
 * predictable for e2e snapshots.
 */
const ROW_ICON_BG_PALETTE = ['#264E78', '#3B6E9E', '#5F8AB8'];

export const NewsDashboardCard = () => {
  const { i18n } = useLingui();
  const settings = useSettings();
  const news = useNews();

  if (settings.loading) return <></>;

  const countryName = settings.userSettings?.countryName || '';

  const summaries: NewsItemSummary[] = news.items ?? [];
  const firstItem = summaries[0];

  const cardItems: CardItem[] = summaries.slice(0, 3).map((item, index) => ({
    title: item.title,
    subTitle: item.subTitle,
    actionButtonTitle: i18n._('Read'),
    iconName: 'newspaper',
    iconBgColor: ROW_ICON_BG_PALETTE[index % ROW_ICON_BG_PALETTE.length],
    imageUrl: item.imageUrl || undefined,
    onClick: () => news.openNews(item.id),
  }));

  const cardTitle = firstItem?.title ?? i18n._('Loading news...');
  const previewImageUrl = firstItem?.imageUrl ?? '';
  const handleCardClick = firstItem ? () => news.openNews(firstItem.id) : undefined;

  return (
    <Stack data-testid="news-dashboard-card" sx={{ gap: '20px' }}>
      <SectionHeader
        title={i18n._('Current Events')}
        subTitle={i18n._('AI-generated English learning content inspired by current events')}
      />

      <StoreCard
        textColor={'#fff'}
        backgroundColor={NEWS_CARD_BG}
        previewImageUrl={previewImageUrl}
        badge={countryName || undefined}
        label={i18n._('TODAY IN THE NEWS')}
        title={cardTitle}
        items={cardItems}
        emptyItemsStateText={i18n._('No news yet for your country today.')}
        itemsBackgroundColor={NEWS_CARD_ITEMS_BG}
        itemsViewMode={'list'}
        onClick={handleCardClick}
      />
    </Stack>
  );
};
