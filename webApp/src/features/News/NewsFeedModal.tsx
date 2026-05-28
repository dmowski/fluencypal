'use client';

import { useLingui } from '@lingui/react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { LoadingShapes } from '../uiKit/Loading/LoadingShapes';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { StyledSelect } from '../uiKit/StyledSelect/StyledSelect';
import {
  NEWS_CATEGORY_FILTER_OPTIONS,
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

  const categoryOptions = NEWS_CATEGORY_FILTER_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label === 'All' ? i18n._('All') : option.label,
  }));

  const items = news.items ?? [];
  const isInitialLoading = (news.isLoading || news.isGenerating) && items.length === 0;
  const previousItems = news.previousItems ?? [];
  const hasPreviousLoaded = news.previousItems !== null;

  return (
    <CustomModal isOpen={true} onClose={onClose} mobilePadding="0" desktopPadding="0">
      <Stack
        sx={{
          backgroundColor: '#232323',
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
            gap: '74px',
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
              <StyledSelect
                data-testid="news-category-select"
                value={news.categoryFilter}
                onChange={(v) => news.setCategoryFilter(v)}
                options={categoryOptions}
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
            <Stack
              sx={{
                gap: '76px',
                '@media (max-width: 600px)': {
                  gap: '40px',
                },
              }}
              data-testid="news-feed-modal-list"
            >
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

          {/* Previous day news */}
          {news.hasMorePrevious && !news.isPreviousLoading && !isInitialLoading && (
            <Button
              data-testid="load-previous-news-btn"
              variant="outlined"
              onClick={() => void news.loadPreviousDay()}
              sx={{
                alignSelf: 'center',
                color: '#EBEBF5',
                borderColor: 'rgba(235,235,245,0.3)',
                '&:hover': { borderColor: '#EBEBF5' },
              }}
            >
              {hasPreviousLoaded ? i18n._('Load more previous news') : i18n._('Load previous news')}
            </Button>
          )}

          {news.isPreviousLoading && (
            <Stack sx={{ gap: '20px' }} data-testid="previous-news-loading">
              <LoadingShapes sizes={['30px', '200px', '30px', '200px']} />
            </Stack>
          )}

          {hasPreviousLoaded && !news.isPreviousLoading && (
            <Stack sx={{ gap: '16px' }}>
              <Typography variant="h5" sx={{ fontWeight: 600, opacity: 0.7 }}>
                {i18n._('Previous news')}
              </Typography>
              {previousItems.length === 0 && !news.hasMorePrevious ? (
                <Typography variant="body2" sx={{ opacity: 0.6 }} data-testid="previous-news-empty">
                  {i18n._('No previous news found.')}
                </Typography>
              ) : (
                <Stack
                  sx={{
                    gap: '76px',
                    '@media (max-width: 600px)': { gap: '40px' },
                  }}
                  data-testid="previous-news-list"
                >
                  {previousItems.map((item) => (
                    <NewsPreviewCard
                      key={item.id}
                      data-testid="previous-news-card"
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
          )}
        </Stack>
      </Stack>
    </CustomModal>
  );
};
