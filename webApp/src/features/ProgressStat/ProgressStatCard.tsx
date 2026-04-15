'use client';

import { Box, Chip, Divider, Stack, Tooltip, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import dayjs from 'dayjs';
import type { ProgressStat, ProgressSourceType, ProgressMetric } from './types';
import { METRIC_COLOR } from './data';

const MetricBadge = ({ label, value }: { label: ProgressMetric; value: number }) => (
  <Stack sx={{ alignItems: 'center', gap: '2px', minWidth: '124px' }}>
    <Typography variant="h3" component={'span'} sx={{ fontWeight: 500 }}>
      {value}
    </Typography>

    <Typography
      variant="h6"
      component={'span'}
      sx={{
        color: METRIC_COLOR[label] ?? 'text.secondary',
        fontWeight: 400,
        textTransform: 'capitalize',
      }}
    >
      {label}
    </Typography>
  </Stack>
);

export const ProgressStatCard = ({ stat }: { stat: ProgressStat }) => {
  const { i18n } = useLingui();

  const sourceTypeLabel: Record<ProgressSourceType, string> = {
    conversation: i18n._('Conversation'),
    'role-play': i18n._('Role-play'),
    'daily-question-answer': i18n._('Daily Q&A'),
  };

  return (
    <Stack
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '12px',
        padding: '16px',
        gap: '12px',
        backgroundColor: 'background.paper',
      }}
    >
      <Stack
        direction="row"
        sx={{
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <Stack sx={{ gap: '4px' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {dayjs(stat.createdAtIso).format('D MMM YYYY, HH:mm')}
            {' | '}
            {sourceTypeLabel[stat.sourceType] ?? stat.sourceType}
          </Typography>
        </Stack>
        <Tooltip
          title={`${i18n._('Assessment confidence')}: ${stat.assessmentConfidence}/100 — ${stat.assessmentConfidenceSummary}`}
          arrow
        >
          <Stack sx={{ alignItems: 'flex-end', gap: '2px', cursor: 'help' }}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                b: {
                  fontWeight: 700,
                  color: '#fff',
                },
              }}
            >
              {i18n._('AI confidence')}
              {' | '} <b>{stat.assessmentConfidence}</b>/100
            </Typography>
          </Stack>
        </Tooltip>
      </Stack>

      <Divider />

      <Stack sx={{ gap: '6px' }}>
        {(
          [
            ['grammar', stat.grammarSummary, stat.grammar],
            ['vocabulary', stat.vocabularySummary, stat.vocabulary],
            ['fluency', stat.fluencySummary, stat.fluency],
            ['confidence', stat.confidenceSummary, stat.confidence],
          ] as const
        ).map(([key, summary, value]) => (
          <Stack key={key} sx={{ gap: '6px', alignItems: 'flex-start' }}>
            <Typography
              component={'span'}
              sx={{
                color: METRIC_COLOR[key],
                textTransform: 'capitalize',
                minWidth: '72px',
              }}
            >
              {key} ({value}):{' '}
              <Typography component={'span'} sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                {summary}
              </Typography>
            </Typography>
          </Stack>
        ))}
      </Stack>

      {stat.sourceText && (
        <Box
          sx={{
            borderRadius: '8px',
            padding: '8px 12px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: '#dfdfdf',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.5,
            }}
          >
            {stat.sourceText}
          </Typography>
        </Box>
      )}

      <Stack direction="row" sx={{ gap: '16px', flexWrap: 'wrap' }}>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          {i18n._('Length')}: {stat.textLength} {i18n._('chars')}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          {i18n._('Algorithm')}: {stat.algorithmVersion}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled', wordBreak: 'break-all' }}>
          {i18n._('Source ID')}: {stat.sourceId}
        </Typography>
      </Stack>
    </Stack>
  );
};
