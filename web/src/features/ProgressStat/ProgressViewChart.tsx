'use client';

import { useLingui } from '@lingui/react';
import {
  Button,
  ButtonGroup,
  FormControl,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Popover,
  Select,
  Stack,
  Tooltip,
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
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronsUpDown,
  Settings,
  TriangleAlert,
} from 'lucide-react';
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
  defaultPeriod = 'last-30-days',
  hideDurationSelector = false,
}: {
  progressStats: ProgressStat[];
  loadingProgressStats: boolean;
  defaultPeriod?: ProgressPeriod;
  hideDurationSelector?: boolean;
}) => {
  const { i18n } = useLingui();
  const isShowSettings = false;
  const [selectedMetric, setSelectedMetric] = useState<ProgressMetric>('fluency');
  const [valueMode, setValueMode] = useState<ProgressValueMode>('raw');
  const [selectedPeriod, setSelectedPeriod] = useState<ProgressPeriod>(defaultPeriod);
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
      .filter((value): value is number => typeof value === 'number' && value > 0);

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

  const { isChangeExists, isPositiveChange, changeComparedToPreviousPeriod } = useMemo(() => {
    if (!sourceChartData.length || !chartData.length || selectedPeriod === 'all-time') {
      return { isChangeExists: false, isPositiveChange: true, changeComparedToPreviousPeriod: 0 };
    }

    const metricKey =
      valueMode === 'smoothed'
        ? (`${selectedMetric}Smoothed` as
            | 'grammarSmoothed'
            | 'vocabularySmoothed'
            | 'fluencySmoothed'
            | 'confidenceSmoothed')
        : selectedMetric;

    const getAverage = (data: typeof sourceChartData) => {
      const values = data
        .map((point) => point[metricKey])
        .filter((value): value is number => typeof value === 'number' && value > 0);
      if (!values.length) return 0;
      return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
    };

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
    const currentPeriodStart = latestTimestamp - periodMs;
    const previousPeriodStart = latestTimestamp - 2 * periodMs;

    const previousPeriodData = sourceChartData.filter((point) => {
      const timestamp = new Date(point.createdAtIso).getTime();
      return timestamp >= previousPeriodStart && timestamp < currentPeriodStart;
    });

    if (!previousPeriodData.length) {
      return { isChangeExists: false, isPositiveChange: true, changeComparedToPreviousPeriod: 0 };
    }

    const previousAverage = getAverage(previousPeriodData);
    const diff = averageLevel - previousAverage;
    return {
      isChangeExists: true,
      isPositiveChange: diff >= 0,
      changeComparedToPreviousPeriod: Math.abs(diff),
    };
  }, [sourceChartData, chartData, selectedMetric, valueMode, selectedPeriod, averageLevel]);

  const toggleSelectedPeriod = () => {
    const periods: ProgressPeriod[] = ['last-30-days', 'last-3-month', 'last-6-month'];
    const nextIndex = (periods.indexOf(selectedPeriod) + 1) % periods.length;
    const nextPeriod = periods[nextIndex];
    setSelectedPeriod(nextPeriod);
  };

  const periodLabelMap: Record<ProgressPeriod, string> = {
    'last-30-days': '30 days',
    'last-3-month': '3 months',
    'last-6-month': '6 month',
    'all-time': 'All time',
  };

  const keyMetric = (
    <Stack
      sx={{
        flexDirection: 'row',
        gap: '0',
        alignItems: 'center',
        opacity: isEmpty ? 0.3 : 1,
      }}
    >
      <Tooltip title={i18n._('Average level during the selected period')} placement="top">
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            minWidth: '65px',
          }}
        >
          {averageLevel}%
        </Typography>
      </Tooltip>

      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: '3px',
          paddingTop: '4px',
        }}
      >
        <Stack
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
            minWidth: '55px',
            justifyContent: 'flex-end',
            gap: '4px',
            color: isChangeExists
              ? isPositiveChange
                ? 'oklch(76.5% .177 163.223)'
                : 'oklch(70.4% .191 22.216)'
              : 'rgba(243,246,255,0.72)',
          }}
        >
          {isChangeExists ? (
            <>
              {isPositiveChange ? (
                <ArrowUp size="18px" strokeWidth="3px" />
              ) : (
                <ArrowDown size="18px" strokeWidth="3px" />
              )}
            </>
          ) : (
            <ArrowUp
              size="18px"
              strokeWidth="3px"
              style={{
                opacity: 0.5,
              }}
            />
          )}
          <Tooltip
            title={!isChangeExists ? i18n._('No previous data to compare') : ''}
            placement="top"
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: isChangeExists ? 700 : 400,
                opacity: isChangeExists ? 1 : 0.5,
              }}
            >{`${isChangeExists ? changeComparedToPreviousPeriod + '%' : '- %'}`}</Typography>
          </Tooltip>
        </Stack>

        <Stack
          component={hideDurationSelector ? 'div' : 'button'}
          onClick={
            hideDurationSelector
              ? undefined
              : (e: React.MouseEvent) => {
                  e.preventDefault();
                  toggleSelectedPeriod();
                }
          }
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: '2px',
            backgroundColor: 'transparent',
            padding: '10px',
            textAlign: 'left',
            border: 'none',
            cursor: hideDurationSelector ? 'default' : 'pointer',
            color: 'rgba(243,246,255,0.72)',
            ':hover': {
              color: hideDurationSelector ? 'rgba(243,246,255,0.72)' : 'rgba(243,246,255,1)',
            },
            ':hover .text': {
              textDecorationColor: hideDurationSelector
                ? 'rgba(243, 246, 255, 0.4)'
                : 'rgba(243, 246, 255, 0.72)',
            },
          }}
        >
          <Typography
            variant="body2"
            className="text"
            sx={{
              color: 'rgba(243,246,255,0.72)',
              textDecorationStyle: hideDurationSelector ? 'none' : 'dashed',
              textDecorationLine: 'underline',
              textDecorationColor: hideDurationSelector
                ? 'transparent'
                : 'rgba(243, 246, 255, 0.4)',
              textUnderlineOffset: '5px',
              textWrap: 'balance',

              '@media (max-width: 400px)': {
                fontSize: '11px',
              },
            }}
          >
            {'vs. prev period'} ({periodLabelMap[selectedPeriod]})
          </Typography>
          {!hideDurationSelector && <ChevronsUpDown size={'14px'} />}
        </Stack>
      </Stack>
    </Stack>
  );

  const metricSelector = (
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
          <Stack
            sx={{ alignItems: 'center', flexDirection: 'row', gap: '14px', paddingTop: '1px' }}
          >
            <Stack
              sx={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: metricColorMap[value],
              }}
            />
            <Typography
              variant="body2"
              sx={{
                paddingBottom: '0',
              }}
            >
              {metricLabelMap[value]}
            </Typography>
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

      {isShowSettings && (
        <IconButton onClick={onSettingsOpen} aria-label={i18n._('Open progress settings')}>
          <Settings size={'18px'} />
        </IconButton>
      )}
    </Stack>
  );

  return (
    <Stack sx={{}}>
      <Stack
        sx={{
          width: '100%',
          padding: '25px 20px 25px 20px',
          flexDirection: 'row',
          gap: '20px 10px',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          '@media (max-width: 350px)': {
            paddingRight: '0',
          },
        }}
      >
        {keyMetric}
        {metricSelector}
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

          <FormControl size="small" fullWidth>
            <InputLabel id="progress-value-mode-select-label">{i18n._('Value Mode')}</InputLabel>
            <Select
              labelId="progress-value-mode-select-label"
              value={valueMode}
              label={i18n._('Value Mode')}
              onChange={(event) => setValueMode(event.target.value as ProgressValueMode)}
            >
              <MenuItem value="raw">{i18n._('Raw')}</MenuItem>
              <MenuItem value="smoothed">{i18n._('Smoothed')}</MenuItem>
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
