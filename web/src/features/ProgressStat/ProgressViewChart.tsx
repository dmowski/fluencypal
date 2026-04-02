'use client';

import { useLingui } from '@lingui/react';
import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { ProgressChart } from './ProgressChart';
import {
  buildSmoothedChartPoints,
  mockProgressStats,
  mockProgressWaveChartPoints,
  mockSparseProgressChartPoints,
} from './mockData';
import { useProgressAggregation } from './useProgressAggregation';
import { ProgressChartStatus, ProgressMetric, ProgressStat, ProgressValueMode } from './types';
import { useMemo, useState } from 'react';
import { Check, ChevronDown, Settings } from 'lucide-react';
import dayjs from 'dayjs';
import { uniq } from '@/libs/uniq';

const metricColorMap: Record<ProgressMetric, string> = {
  grammar: '#4da3ff',
  vocabulary: '#43e67b',
  fluency: '#ff9a3d',
  confidence: '#8f7cff',
};

type ProgressPeriod = 'last-30-days' | 'last-3-month' | 'last-6-month' | 'all-time';

export const ProgressViewChart = ({
  progressStats,
  loadingProgressStats,
}: {
  progressStats: ProgressStat[];
  loadingProgressStats: boolean;
}) => {
  const { i18n } = useLingui();
  const [selectedMetric, setSelectedMetric] = useState<ProgressMetric>('fluency');
  const [valueMode, setValueMode] = useState<ProgressValueMode>('raw');
  const [selectedPeriod, setSelectedPeriod] = useState<ProgressPeriod>('all-time');
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<HTMLElement | null>(null);

  const firestoreChartData = useProgressAggregation(progressStats);

  const sourceChartData = firestoreChartData;

  const chartData = useMemo(() => {
    const isOnlyOneDay =
      uniq(sourceChartData.map((point) => dayjs(point.createdAtIso).format('YYYY-MM-DD')))
        .length === 1;

    if (isOnlyOneDay) {
      return [];
    }

    if (selectedPeriod === 'all-time' || sourceChartData.length === 0) {
      return sourceChartData;
    }

    const latestTimestamp = Math.max(
      ...sourceChartData.map((point) => new Date(point.createdAtIso).getTime()),
    );

    const dayMs = 24 * 60 * 60 * 1000;
    const periodMsMap: Record<Exclude<ProgressPeriod, 'all-time'>, number> = {
      'last-30-days': 30 * dayMs,
      'last-3-month': 90 * dayMs,
      'last-6-month': 180 * dayMs,
    };

    const periodMs = periodMsMap[selectedPeriod];
    const thresholdTimestamp = latestTimestamp - periodMs;

    const dataFiltered = sourceChartData.filter(
      (point) => new Date(point.createdAtIso).getTime() >= thresholdTimestamp,
    );

    return dataFiltered;
  }, [selectedPeriod, sourceChartData]);

  const status = useMemo<ProgressChartStatus>(() => {
    return chartData.length === 0 ? 'empty' : 'ready';
  }, [chartData.length, loadingProgressStats]);

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

  const onSettingsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const onSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  const settingsOpen = Boolean(settingsAnchorEl);

  const isEmpty = status === 'empty';

  return (
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

          <IconButton onClick={onSettingsOpen} aria-label={i18n._('Open progress settings')}>
            <Settings size={'18px'} />
          </IconButton>
        </Stack>
      </Stack>

      <Popover
        open={settingsOpen}
        anchorEl={settingsAnchorEl}
        onClose={onSettingsClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: '240px',
              backgroundColor: '#121212',
              padding: '20px 20px 20px 20px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0px 0px 22px rgba(0, 0, 0, 0.5)',
            },
          },
        }}
      >
        <Stack sx={{ gap: '24px' }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
            }}
          >
            {i18n._('Progress Settings')}
          </Typography>

          <FormControl size="small" fullWidth>
            <InputLabel id="progress-period-select-label">{i18n._('Period')}</InputLabel>
            <Select
              labelId="progress-period-select-label"
              value={selectedPeriod}
              label={i18n._('Period')}
              onChange={(event) => setSelectedPeriod(event.target.value as ProgressPeriod)}
            >
              <MenuItem value="last-30-days">{i18n._('Last 30 days')}</MenuItem>
              <MenuItem value="last-3-month">{i18n._('Last 3 month')}</MenuItem>
              <MenuItem value="last-6-month">{i18n._('Last 6 month')}</MenuItem>
              <MenuItem value="all-time">{i18n._('All time')}</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Popover>

      <ProgressChart
        data={chartData}
        metric={selectedMetric}
        valueMode={valueMode}
        status={status}
        height={320}
        emptyPreviewData={mockProgressWaveChartPoints}
      />
    </Stack>
  );
};
