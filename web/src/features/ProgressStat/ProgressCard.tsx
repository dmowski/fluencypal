'use client';

import { useLingui } from '@lingui/react';
import { MenuItem, Select, Stack, Typography } from '@mui/material';
import { SectionHeader } from '@/features/Dashboard/CartsHeader';
import { ProgressChart } from './ProgressChart';
import { mockProgressStats } from './mockData';
import { useProgressAggregation } from './useProgressAggregation';
import { useProgressStats } from './useProgressStats';
import { ProgressChartStatus, ProgressMetric, ProgressValueMode } from './types';
import { useMemo, useState } from 'react';
import { StoreCard } from '../uiKit/Card/StoreCard/StoreCard';
import { Check, ChevronDown } from 'lucide-react';
import { useBackgroundProgressEvaluation } from './useBackgroundProgressEvaluation';

const imageUrl =
  'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1774984465436-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png';

const metricColorMap: Record<ProgressMetric, string> = {
  grammar: '#4da3ff',
  vocabulary: '#43e67b',
  fluency: '#ff9a3d',
  confidence: '#8f7cff',
};

export const ProgressCard = () => {
  const { i18n } = useLingui();
  const [selectedMetric, setSelectedMetric] = useState<ProgressMetric>('fluency');
  const [valueMode, setValueMode] = useState<ProgressValueMode>('smoothed');
  useBackgroundProgressEvaluation();

  const { progressStats, loadingProgressStats } = useProgressStats();
  const firestoreChartData = useProgressAggregation(progressStats);
  const mockChartData = useProgressAggregation(mockProgressStats);

  const useMockDataSource = false;
  const isLocked = false;
  const chartData = useMockDataSource ? mockChartData : firestoreChartData;

  const status = useMemo<ProgressChartStatus>(() => {
    if (isLocked) {
      return 'locked';
    }

    if (!useMockDataSource && loadingProgressStats) {
      return 'loading';
    }

    return chartData.length === 0 ? 'empty' : 'ready';
  }, [chartData.length, loadingProgressStats, isLocked, useMockDataSource]);

  const metricLabelMap: Record<ProgressMetric, string> = {
    grammar: i18n._('Grammar'),
    vocabulary: i18n._('Vocabulary'),
    fluency: i18n._('Fluency'),
    confidence: i18n._('Confidence'),
  };

  const metricOptions: Array<{ metric: ProgressMetric; label: string }> = [
    { metric: 'grammar', label: metricLabelMap.grammar },
    { metric: 'vocabulary', label: metricLabelMap.vocabulary },
    { metric: 'fluency', label: metricLabelMap.fluency },
    { metric: 'confidence', label: metricLabelMap.confidence },
  ];

  const averageLevel = useMemo(() => {
    if (!chartData.length) {
      return 0;
    }

    const metricKey =
      valueMode === 'smoothed'
        ? (`${selectedMetric}Smoothed` as
            | 'grammarSmoothed'
            | 'vocabularySmoothed'
            | 'fluencySmoothed'
            | 'confidenceSmoothed')
        : selectedMetric;

    const values = chartData
      .map((point) => point[metricKey])
      .filter((value): value is number => typeof value === 'number');

    if (!values.length) {
      return 0;
    }

    const score = values.reduce((sum, value) => sum + value, 0) / values.length;
    return Math.round(score);
  }, [chartData, selectedMetric, valueMode]);

  const onSelectedMetricChange = (metric: ProgressMetric) => {
    setSelectedMetric(metric);
  };

  const isEmpty = status === 'empty';

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
                opacity: isEmpty ? 0.3 : 1,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                }}
              >
                {averageLevel}%
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(243,246,255,0.72)',
                  paddingBottom: '2px',
                }}
              >
                {i18n._('Average Level')}
              </Typography>
            </Stack>

            <Stack
              sx={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <Select
                value={selectedMetric}
                onChange={(event) => onSelectedMetricChange(event.target.value as ProgressMetric)}
                displayEmpty
                size="small"
                IconComponent={(iconProps) => <ChevronDown size={18} {...iconProps} />}
                sx={{
                  minWidth: '170px',
                  color: '#f7f9ff',
                  borderRadius: '10px',
                  '.MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.24)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(77, 163, 255, 0.3)',
                  },
                }}
                renderValue={(value) => (
                  <Stack sx={{ alignItems: 'center', flexDirection: 'row', gap: '14px' }}>
                    <Stack
                      sx={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: metricColorMap[value],
                      }}
                    />
                    <Typography variant="body2">{metricLabelMap[value]}</Typography>
                  </Stack>
                )}
              >
                {metricOptions.map((option) => (
                  <MenuItem key={option.metric} value={option.metric}>
                    <Stack
                      sx={{
                        width: '100%',
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        gap: '12px',
                        padding: '6px 5px',
                      }}
                    >
                      <Stack sx={{ alignItems: 'center', flexDirection: 'row', gap: '14px' }}>
                        <Stack
                          sx={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: metricColorMap[option.metric],
                          }}
                        />
                        <Typography variant="body1">{option.label}</Typography>
                      </Stack>
                      {selectedMetric === option.metric && <Check size={16} />}
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </Stack>
          </Stack>
          <ProgressChart
            data={chartData}
            metric={selectedMetric}
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
