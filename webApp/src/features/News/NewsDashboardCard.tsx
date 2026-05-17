'use client';

import { useLingui } from '@lingui/react';
import Stack from '@mui/material/Stack';

import { SectionHeader } from '../Dashboard/CartsHeader';
import { StoreCard } from '../uiKit/Card/StoreCard/StoreCard';
import type { CardItem } from '../uiKit/Card/StoreCard/types';
import { useSettings } from '../Settings/useSettings';

import { NewsSettingsMenu } from './NewsSettingsMenu';
import { useNews } from './useNews';
import { useNewsModal } from './useNewsModal';
import type { NewsItemSummary } from './types';

/**
 * Colors cycled across the 3 news rows; kept short so the palette stays
 * predictable for e2e snapshots.
 */
const ROW_ICON_BG_PALETTE = ['#264E78', '#3B6E9E', '#5F8AB8'];

/**
 * Headlines from gNews can be very long and break the card layout. Trim to a
 * fixed length with an ellipsis so titles stay on one or two lines.
 */
const TITLE_MAX_LENGTH = 50;
const trimTitle = (title: string, length: number = TITLE_MAX_LENGTH): string =>
  title.length > length ? `${title.slice(0, length).trimEnd()}…` : title;

export const NewsDashboardCard = () => {
  const { i18n } = useLingui();
  const settings = useSettings();
  const news = useNews();
  const newsModal = useNewsModal();

  if (settings.loading) return <></>;

  // No country selected anywhere (account + override). The news endpoint has
  // nothing to query with, so hide the card entirely instead of rendering a
  // permanently-empty placeholder.
  if (!news.country) return <></>;

  // Source of truth for the badge is the News context: it already merges the
  // user override with the account country, so we never show a stale label
  // from `userSettings` when the user picked a different country for news.
  const countryName = news.countryName;

  const summaries: NewsItemSummary[] = news.items ?? [];
  const firstItem = summaries[0];

  const cardItems: CardItem[] = summaries.slice(0, 3).map((item, index) => {
    const hasImage = !!item.imageUrl;
    return {
      title: trimTitle(item.title),
      subTitle: item.subTitle,
      actionButtonTitle: i18n._('Read'),
      // CardItemIcon prefers iconName over imageUrl, so omit the icon entirely
      // when we have a real article image — otherwise the user always sees the
      // generic newspaper glyph instead of the story photo.
      ...(hasImage
        ? { imageUrl: item.imageUrl }
        : {
            iconName: 'newspaper',
            iconBgColor: ROW_ICON_BG_PALETTE[index % ROW_ICON_BG_PALETTE.length],
          }),
      onClick: () => newsModal.openNews(item.id),
    };
  });

  // Distinguish loading vs empty vs error so the card doesn't look stuck on
  // "Loading news..." after the fetch resolves with no items.
  const hasItems = summaries.length > 0;
  const isInitialLoading = news.isLoading && !hasItems;
  const hasError = !news.isLoading && !hasItems && news.error !== null;

  let cardTitle: string;
  if (firstItem) {
    cardTitle = trimTitle(firstItem.title, 100);
  } else if (isInitialLoading) {
    cardTitle = i18n._('Loading news...');
  } else if (hasError) {
    cardTitle = i18n._('Could not load news');
  } else {
    cardTitle = i18n._('No news yet for your country today.');
  }

  let emptyItemsStateText: string;
  if (isInitialLoading) {
    emptyItemsStateText = i18n._('Fetching the latest stories...');
  } else if (hasError) {
    emptyItemsStateText = news.error ?? i18n._('Could not load news');
  } else {
    emptyItemsStateText = i18n._('No news yet for your country today.');
  }

  const previewImageUrl = firstItem?.imageUrl ?? '';
  const handleCardClick = firstItem ? () => newsModal.openNews(firstItem.id) : undefined;
  return (
    <Stack data-testid="news-dashboard-card" sx={{ gap: '20px' }}>
      <Stack direction="row" sx={{ alignItems: 'flex-start', gap: '10px' }}>
        <Stack sx={{ flex: 1, minWidth: 0 }}>
          <SectionHeader
            title={i18n._('Discuss with AI')}
            subTitle={i18n._('Inspired by current events')}
          />
        </Stack>
        <NewsSettingsMenu />
      </Stack>
      <StoreCard
        textColor={'#fff'}
        backgroundColor={'rgba(0, 0, 0, 0.6)'}
        previewImageUrl={previewImageUrl}
        title={cardTitle}
        items={cardItems}
        emptyItemsStateText={emptyItemsStateText}
        itemsBackgroundColor={'rgb(34, 34, 34)'}
        itemsViewMode={'list'}
        onClick={handleCardClick}
      />
    </Stack>
  );
};
