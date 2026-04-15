'use client';

import { Box, Chip, Divider, Stack, Tooltip, Typography, Button } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import dayjs from 'dayjs';
import type { ProgressStat, ProgressSourceType, ProgressMetric } from './types';
import { METRIC_COLOR } from './data';

const PREVIEW_LENGTH = 100;

const SourceTextPreview = ({ text }: { text: string }) => {
  const { i18n } = useLingui();
  const [expanded, setExpanded] = useState(false);

  const isLong = text.length > PREVIEW_LENGTH;
  const displayed = isLong && !expanded ? text.slice(0, PREVIEW_LENGTH) + '…' : text;

  return (
    <Stack sx={{ gap: '4px' }}>
      <Typography
        variant="caption"
        sx={{
          color: '#dfdfdf',
          whiteSpace: 'pre-wrap',
          lineHeight: 1.5,
        }}
      >
        {i18n._('Source text:')}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: '#dfdfdf',
          whiteSpace: 'pre-wrap',
          lineHeight: 1.5,
        }}
      >
        {displayed}
      </Typography>
      {isLong && (
        <Button
          size="small"
          variant="text"
          onClick={() => setExpanded((prev) => !prev)}
          sx={{ alignSelf: 'flex-start', padding: 0, minWidth: 0, textTransform: 'none' }}
        >
          {expanded ? i18n._('Show less') : i18n._('Show more')}
        </Button>
      )}
    </Stack>
  );
};

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
        sx={{
          alignItems: 'flex-start',
          flexDirection: 'row',
          gap: '5px',
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {dayjs(stat.createdAtIso).format('D MMM YYYY, HH:mm')}
          {' | '}
          {sourceTypeLabel[stat.sourceType] ?? stat.sourceType} {' | '}
        </Typography>

        <Tooltip
          title={`${i18n._('Assessment confidence')}: ${stat.assessmentConfidence}/100 — ${stat.assessmentConfidenceSummary}`}
          arrow
        >
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
            {i18n._('AI confidence')}: <b>{stat.assessmentConfidence}%</b>
          </Typography>
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
              {value}% - {key}:{' '}
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
          <SourceTextPreview text={stat.sourceText} />
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
