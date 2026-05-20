'use client';

import { useLingui } from '@lingui/react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { LoadingShapes } from '../uiKit/Loading/LoadingShapes';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { StyledSelect } from '../uiKit/StyledSelect/StyledSelect';
import {
  NEWS_COMPLEXITY_LABELS,
  NEWS_COMPLEXITY_OPTIONS,
  NEWS_SUPPORTED_COUNTRIES,
} from './constants';
import type { NewsLanguageComplexity } from './types';
import { useNews } from './useNews';
import { useNewsModal } from './useNewsModal';
import { NewsPreviewCard } from './NewsPreviewCard';

export const NewsFeedModal = () => {
  const { isFeedOpen, closeFeed, openNews } = useNewsModal();

  if (!isFeedOpen) return null;

  return <NewsFeedModalContent onClose={closeFeed} onOpenNews={openNews} />;
};

interface NewsFeedModalContentProps {
  onClose: () => void;
  onOpenNews: (id: string) => void;
}

const NewsFeedModalContent = ({ onClose, onOpenNews }: NewsFeedModalContentProps) => {
  const { i18n } = useLingui();
  const news = useNews();

  const complexityOptions = NEWS_COMPLEXITY_OPTIONS.map((level) => ({
    value: level,
    label: NEWS_COMPLEXITY_LABELS[level],
  }));

  const countryOptions = [
    { value: '__auto__', label: i18n._('Auto') },
    ...NEWS_SUPPORTED_COUNTRIES.map((c) => ({ value: c.code, label: c.name })),
  ];

  const countryValue = news.countryOverride ?? '__auto__';

  const handleCountryChange = (value: string) => {
    news.setCountryOverride(value === '__auto__' ? null : value);
  };

  const items = news.items ?? [];
  const isInitialLoading = news.isLoading && items.length === 0;

  return (
    <CustomModal isOpen={true} onClose={onClose} mobilePadding="0" desktopPadding="0">
      <Stack
        sx={{
          backgroundColor: '#222',
          color: '#EBEBF5',
          width: '100%',
          height: '100%',
          padding: '0 10px',
          overflowY: 'auto',
        }}
      >
        <Stack
          data-testid="news-feed-modal"
          sx={{
            gap: '124px',
            padding: '20px 5px 80px',
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          {/* Header */}
          <Stack sx={{ gap: '16px' }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {i18n._('News')}
            </Typography>
            <Stack sx={{ flexDirection: 'row', gap: '12px', flexWrap: 'wrap' }}>
              <StyledSelect
                data-testid="news-country-select"
                value={countryValue}
                onChange={handleCountryChange}
                options={countryOptions}
              />
              <StyledSelect
                data-testid="news-complexity-select"
                value={news.complexity}
                onChange={(v) => news.setComplexity(v as NewsLanguageComplexity)}
                options={complexityOptions}
              />
            </Stack>
          </Stack>

          {/* Content */}
          {isInitialLoading ? (
            <Stack sx={{ gap: '20px' }} data-testid="news-feed-modal-loading">
              <LoadingShapes sizes={['30px', '200px', '30px', '200px']} />
            </Stack>
          ) : items.length === 0 ? (
            <Typography variant="body2" sx={{ opacity: 0.6 }} data-testid="news-feed-modal-empty">
              {news.error ?? i18n._('No news yet for your country today.')}
            </Typography>
          ) : (
            <Stack sx={{ gap: '76px' }} data-testid="news-feed-modal-list">
              {items.map((item) => (
                <NewsPreviewCard
                  key={item.id}
                  data-testid="news-preview-card"
                  title={item.title}
                  subTitle={item.subTitle}
                  imageUrl={item.imageUrl}
                  dateIso={item.dateIso}
                  onClick={() => onOpenNews(item.id)}
                />
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    </CustomModal>
  );
};
