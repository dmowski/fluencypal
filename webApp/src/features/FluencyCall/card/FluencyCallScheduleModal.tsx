'use client';

import { Box, Button, Stack, Typography } from '@mui/material';
import { Plus } from 'lucide-react';
import { useLingui } from '@lingui/react';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { ModalHeader } from '@/features/uiKit/Modal/ModalHeader';
import { FluencyCallJoinButton } from './FluencyCallJoinButton';
import { textButtonSx, token } from './styles';
import { FluencyCallCardCall, FluencyCallCardViewProps } from './types';

export const FluencyCallScheduleModal = ({
  open,
  calls,
  timeZoneLabel,
  callPeople,
  canJoin,
  requestedAtLabel,
  pendingCallId,
  alert,
  onClose,
  onToggle,
  onInitiateCall,
}: {
  open: boolean;
  calls: FluencyCallCardCall[];
  timeZoneLabel: string;
  callPeople?: FluencyCallCardViewProps['callPeople'];
  canJoin: boolean;
  requestedAtLabel: string | null;
  pendingCallId: string | null;
  alert: string;
  onClose: () => void;
  onToggle: (call: FluencyCallCardCall) => Promise<void>;
  onInitiateCall: () => void;
}) => {
  const { i18n } = useLingui();

  return (
    <CustomModal
      isOpen={open}
      onClose={onClose}
      zIndex={1400}
      backgroundColor={token.bg}
      data-testid="fluency-call-schedule-modal"
    >
      <Stack sx={{ width: '100%', maxWidth: '600px', gap: '8px' }}>
        <ModalHeader
          title={i18n._('Upcoming conversations')}
          subtitle={i18n._('All times in {zone}', { zone: timeZoneLabel })}
        />
        <Stack>
          {calls.map((call) => (
            <Stack
              key={call.id}
              data-testid={`fluency-call-other-${call.id}`}
              sx={{
                gap: '4px',
                padding: '17px 0',
                borderBottom: `1px solid ${token.line}`,
              }}
            >
              <Stack
                direction="row"
                sx={{
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: token.text, fontWeight: 650, overflowWrap: 'anywhere' }}>
                    {call.title}
                  </Typography>
                  <Typography sx={{ color: token.muted, fontSize: '13px' }}>
                    {call.dateLabel} · {i18n._('{count} joining', { count: call.participantCount })}
                  </Typography>
                </Box>
                <FluencyCallJoinButton
                  call={call}
                  pendingCallId={pendingCallId}
                  onToggle={onToggle}
                />
              </Stack>
              {callPeople?.(call)}
            </Stack>
          ))}
          {calls.length === 0 ? (
            <Typography
              data-testid="fluency-call-no-other"
              sx={{ color: token.muted, paddingTop: '12px' }}
            >
              {i18n._('No other calls scheduled yet.')}
            </Typography>
          ) : null}
          {canJoin && requestedAtLabel ? (
            <Stack data-testid="fluency-call-request-sent" sx={{ gap: '6px', paddingTop: '16px' }}>
              <Typography sx={{ fontWeight: 800, color: '#7DDEAA' }}>
                {i18n._('Request sent')}
              </Typography>
              <Typography sx={{ fontWeight: 700, color: token.text }}>
                {requestedAtLabel}
              </Typography>
              <Typography sx={{ color: token.muted }}>{i18n._("We'll reply soon.")}</Typography>
            </Stack>
          ) : null}
          {canJoin && !requestedAtLabel ? (
            <Button
              data-testid="fluency-call-initiate"
              data-analytics="community-call-propose"
              color="info"
              onClick={onInitiateCall}
              startIcon={<Plus size={16} />}
              sx={{ ...textButtonSx, alignSelf: 'flex-start', marginTop: '12px' }}
            >
              {i18n._('Propose a conversation')}
            </Button>
          ) : null}
          {canJoin && requestedAtLabel ? (
            <Button
              data-testid="fluency-call-change-time"
              data-analytics="community-call-change-time"
              color="info"
              onClick={onInitiateCall}
              sx={{ ...textButtonSx, alignSelf: 'flex-start', marginTop: '8px' }}
            >
              {i18n._('Change time')}
            </Button>
          ) : null}
        </Stack>
        {alert ? (
          <Typography role="alert" sx={{ color: token.danger, fontSize: '13px' }}>
            {alert}
          </Typography>
        ) : null}
      </Stack>
    </CustomModal>
  );
};
