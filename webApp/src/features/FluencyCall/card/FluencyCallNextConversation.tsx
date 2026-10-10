'use client';

import { Box, Button, Stack, Typography } from '@mui/material';
import { ArrowRight } from 'lucide-react';
import { useLingui } from '@lingui/react';
import { FluencyCallJoinButton } from './FluencyCallJoinButton';
import { FluencyCallMeetButton } from './FluencyCallMeetButton';
import { narrow, textButtonSx, token } from './styles';
import { FluencyCallCardCall } from './types';

export const FluencyCallNextConversation = ({
  next,
  timeZoneLabel,
  meetUrl,
  pendingCallId,
  onToggle,
  onOpenSchedule,
}: {
  next: FluencyCallCardCall | undefined;
  timeZoneLabel: string;
  meetUrl: string | null;
  pendingCallId: string | null;
  onToggle: (call: FluencyCallCardCall) => Promise<void>;
  onOpenSchedule: () => void;
}) => {
  const { i18n } = useLingui();

  return (
    <>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <Typography
          sx={{
            fontSize: '12px',
            color: token.muted,
            fontWeight: 600,
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          {i18n._('Next conversation')}
        </Typography>
        <Button
          data-testid="fluency-call-other-times"
          color="inherit"
          endIcon={<ArrowRight size={16} />}
          onClick={onOpenSchedule}
          sx={{ ...textButtonSx, padding: '0 10px' }}
        >
          {i18n._('Other times')}
        </Button>
      </Stack>

      {next ? (
        <Stack sx={{ gap: '4px', minWidth: 0 }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <Typography
              component="h3"
              sx={{
                margin: '4px 0',
                color: token.text,
                fontSize: '22px',
                fontWeight: 600,
                overflowWrap: 'anywhere',
              }}
            >
              {next.title}
            </Typography>
            {next.isLive ? (
              <Box
                data-testid={`fluency-call-live-${next.id}`}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#7DDEAA',
                  flexShrink: 0,
                }}
              />
            ) : null}
          </Stack>
          <Typography
            data-testid={`fluency-call-join-count-${next.id}`}
            sx={{ margin: '0 0 20px', color: token.muted, fontSize: '13px' }}
          >
            {next.dateLabel} · {timeZoneLabel} ·{' '}
            {i18n._('{count} joining', { count: next.participantCount })}
          </Typography>
        </Stack>
      ) : (
        <Stack sx={{ gap: '6px', margin: '4px 0 20px' }}>
          <Typography
            component="h3"
            sx={{ margin: 0, color: token.text, fontSize: '22px', fontWeight: 600 }}
          >
            {i18n._('More conversations soon')}
          </Typography>
          <Typography sx={{ margin: 0, color: token.muted }}>
            {i18n._('Say hello in the chat while we plan the next call.')}
          </Typography>
        </Stack>
      )}

      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          gap: '18px',
          flexWrap: 'wrap',
          [narrow]: { gap: '8px' },
        }}
      >
        <FluencyCallMeetButton meetUrl={meetUrl} />
        {next ? (
          <FluencyCallJoinButton call={next} pendingCallId={pendingCallId} onToggle={onToggle} />
        ) : null}
      </Stack>
      <Typography sx={{ margin: '10px 0 0', color: token.muted, fontSize: '12px' }}>
        {i18n._('Speak when you are ready. You can listen first.')}
      </Typography>
    </>
  );
};
