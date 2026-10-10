'use client';

import { Box, Button, Stack, Typography } from '@mui/material';
import { ArrowRight, Check, Plus } from 'lucide-react';
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
    <Stack
      sx={{
        gap: '20px',
      }}
    >
      {next ? (
        <Stack sx={{ gap: '4px', minWidth: 0 }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <Typography
              component="h4"
              sx={{
                color: token.text,
                fontSize: '20px',
                fontWeight: 500,
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
            sx={{ color: token.muted, fontSize: '13px' }}
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

      <Stack>
        <Stack
          sx={{
            gap: '12px',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            [narrow]: { gap: '8px' },
          }}
        >
          <FluencyCallMeetButton meetUrl={meetUrl} />
          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            {next ? (
              <Button
                data-testid={`fluency-call-join-${next.id}`}
                data-analytics="community-call-rsvp"
                aria-pressed={next.isJoining}
                color="inherit"
                disabled={pendingCallId !== null}
                onClick={() => {
                  void onToggle(next);
                }}
                startIcon={next.isJoining ? <Check size={16} /> : <Plus size={16} />}
                sx={{ ...textButtonSx, padding: '0 10px' }}
              >
                {pendingCallId === next.id
                  ? i18n._('Updating...')
                  : next.isJoining
                    ? i18n._("I'm joining")
                    : i18n._("I'll join")}
              </Button>
            ) : null}

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
        </Stack>
      </Stack>
    </Stack>
  );
};
