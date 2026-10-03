'use client';

import { ReactNode } from 'react';
import { Check, MessageSquare, Plus, Users } from 'lucide-react';
import { Badge, Box, Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { GoogleMeetIcon } from './GoogleMeetIcon';

const cardSx = {
  position: 'relative',
  isolation: 'isolate',
  overflow: 'hidden',
  gap: '16px',
  padding: '20px',
  borderRadius: '20px',
  border: '1px solid rgba(148, 145, 255, 0.22)',
  backgroundColor: '#16181e',
  boxShadow: '0 12px 45px #00000020',
  '&::before': {
    content: '""',
    position: 'absolute',
    zIndex: -1,
    top: '-172px',
    left: '-128px',
    width: '360px',
    height: '320px',
    borderRadius: '50%',
    background: 'rgba(58, 40, 255, 0.3)',
    filter: 'blur(152px)',
    pointerEvents: 'none',
  },
};

const outlineButtonSx = {
  minHeight: '40px',
  padding: '8px 14px',
  borderRadius: '10px',
  borderColor: 'rgba(255, 255, 255, 0.16)',
  color: '#b7d4e8',
  fontWeight: 600,
  textTransform: 'none',
  flexShrink: 0,
  '&:hover': {
    borderColor: 'rgba(183, 212, 232, 0.45)',
    backgroundColor: 'rgba(183, 212, 232, 0.08)',
  },
};

export type FluencyCallRowViewProps = {
  callId: string;
  month: string;
  day: string;
  title: string;
  joinCount: number;
  isJoining: boolean;
  isLive: boolean;
  canOpenCall: boolean;
  unreadCount: number;
  isJoinPending: boolean;
  onToggleJoin: () => void;
  onShowChat: () => void;
  onOpenCall: () => void;
};

export const FluencyCallRowView = ({
  callId,
  month,
  day,
  title,
  joinCount,
  isJoining,
  isLive,
  canOpenCall,
  unreadCount,
  isJoinPending,
  onToggleJoin,
  onShowChat,
  onOpenCall,
}: FluencyCallRowViewProps) => {
  const { i18n } = useLingui();

  return (
    <Stack
      data-testid={`fluency-call-row-${callId}`}
      direction="row"
      sx={{
        alignItems: 'center',
        gap: '12px',
        padding: '14px 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        flexWrap: 'wrap',
      }}
    >
      <Stack
        sx={{
          width: 52,
          height: 52,
          flexShrink: 0,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          gap: '1px',
        }}
      >
        <Typography
          sx={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            opacity: 0.6,
            lineHeight: 1,
          }}
        >
          {month}
        </Typography>
        <Typography sx={{ fontSize: '22px', fontWeight: 700, lineHeight: 1 }}>{day}</Typography>
      </Stack>

      <Stack sx={{ flex: '1 1 140px', minWidth: 0, gap: '4px' }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: '8px' }}>
          <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
          {isLive ? (
            <Box
              data-testid={`fluency-call-live-${callId}`}
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
        <Stack direction="row" sx={{ alignItems: 'center', gap: '6px', opacity: 0.7 }}>
          <Users size={14} />
          <Typography
            component="span"
            data-testid={`fluency-call-join-count-${callId}`}
            variant="body2"
          >
            {i18n._('{count} joining', { count: joinCount })}
          </Typography>
        </Stack>
      </Stack>

      <Stack direction="row" sx={{ alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
        <Badge
          color="error"
          badgeContent={unreadCount > 0 ? unreadCount : undefined}
          invisible={unreadCount < 1}
          data-testid={`fluency-call-unread-${callId}`}
        >
          <Button
            variant="outlined"
            data-testid={`fluency-call-show-chat-${callId}`}
            onClick={onShowChat}
            aria-label={i18n._('Show chat')}
            sx={{
              ...outlineButtonSx,
              minWidth: '40px',
              width: '40px',
              padding: 0,
            }}
          >
            <MessageSquare size={18} />
          </Button>
        </Badge>

        {canOpenCall ? (
          <Button
            variant="outlined"
            data-testid={`fluency-call-open-${callId}`}
            onClick={onOpenCall}
            sx={outlineButtonSx}
          >
            {i18n._('Join')}
          </Button>
        ) : (
          <Button
            variant="outlined"
            data-testid={`fluency-call-join-${callId}`}
            aria-pressed={isJoining}
            disabled={isJoinPending}
            onClick={onToggleJoin}
            startIcon={isJoining ? <Check size={16} /> : <Plus size={16} />}
            sx={{
              ...outlineButtonSx,
              ...(isJoining ? { backgroundColor: 'rgba(183, 212, 232, 0.12)' } : {}),
            }}
          >
            {isJoining ? i18n._('Joined') : i18n._("I'll join")}
          </Button>
        )}
      </Stack>
    </Stack>
  );
};

export type FluencyCallCardViewProps = {
  hasCalls: boolean;
  canJoin: boolean;
  requestedAtLabel: string | null;
  paidNotice: boolean;
  accessUntilLabel: string | null;
  timeZoneLabel: string;
  onInitiateCall: () => void;
  onGetAccess: () => void;
  children?: ReactNode;
};

export const FluencyCallCardView = ({
  hasCalls,
  canJoin,
  requestedAtLabel,
  paidNotice,
  accessUntilLabel,
  timeZoneLabel,
  onInitiateCall,
  onGetAccess,
  children,
}: FluencyCallCardViewProps) => {
  const { i18n } = useLingui();
  const hasRequest = Boolean(requestedAtLabel);

  return (
    <Stack data-testid="fluency-call-card" sx={cardSx}>
      <Stack direction="row" sx={{ alignItems: 'flex-start', gap: '12px' }}>
        <Stack
          sx={{
            width: '52px',
            height: '52px',
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: '#252631',
          }}
        >
          <GoogleMeetIcon size={28} />
        </Stack>
        <Stack sx={{ gap: '2px' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {i18n._('Group conversations')}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            {i18n._('On Google Meet')}
          </Typography>
        </Stack>
      </Stack>

      <Typography sx={{ opacity: 0.75, padding: '14px 0' }}>
        {i18n._('Practise speaking with other learners.')}
        <br />
        {i18n._('Join the conversations that fit your week.')}
      </Typography>

      {paidNotice ? (
        <Typography data-testid="fluency-call-paid" sx={{ color: '#7DDEAA', fontWeight: 700 }}>
          {canJoin
            ? i18n._('Payment received. You can join the calls.')
            : i18n._('Payment received. Access shows up in a moment.')}
        </Typography>
      ) : null}

      {accessUntilLabel ? (
        <Typography data-testid="fluency-call-access-until" variant="body2" sx={{ opacity: 0.7 }}>
          {accessUntilLabel}
        </Typography>
      ) : null}

      {hasCalls ? (
        <Stack>
          <Stack
            direction="row"
            sx={{
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: '12px',
              paddingTop: '4px',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {i18n._('Upcoming calls')}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.55 }}>
              {i18n._('All times in {zone}', { zone: timeZoneLabel })}
            </Typography>
          </Stack>
          {children}
        </Stack>
      ) : (
        <Stack sx={{ gap: '12px' }}>
          {canJoin && hasRequest ? (
            <Stack data-testid="fluency-call-request-sent" sx={{ gap: '6px' }}>
              <Typography sx={{ fontWeight: 800, color: '#7DDEAA' }}>
                {i18n._('Request sent')}
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{requestedAtLabel}</Typography>
              <Typography sx={{ opacity: 0.8 }}>{i18n._("We'll reply soon.")}</Typography>
            </Stack>
          ) : (
            <Stack sx={{ gap: '6px' }}>
              <Typography sx={{ fontWeight: 700 }}>{i18n._('No call scheduled yet.')}</Typography>
              {canJoin ? (
                <Typography>{i18n._("Pick a time and we'll set one up.")}</Typography>
              ) : null}
            </Stack>
          )}

          {canJoin && !hasRequest ? (
            <Button
              variant="outlined"
              data-testid="fluency-call-initiate"
              onClick={onInitiateCall}
              startIcon={<Plus size={16} />}
              sx={{ ...outlineButtonSx, alignSelf: 'flex-start' }}
            >
              {i18n._('Propose a call')}
            </Button>
          ) : null}

          {canJoin && hasRequest ? (
            <Button
              variant="outlined"
              data-testid="fluency-call-change-time"
              onClick={onInitiateCall}
              sx={{ ...outlineButtonSx, alignSelf: 'flex-start' }}
            >
              {i18n._('Change time')}
            </Button>
          ) : null}

          {!canJoin ? (
            <Button
              variant="outlined"
              data-testid="fluency-call-get-access"
              data-analytics="buy-access"
              onClick={onGetAccess}
              sx={{ ...outlineButtonSx, alignSelf: 'flex-start' }}
            >
              {i18n._('$2 per month')}
            </Button>
          ) : null}
        </Stack>
      )}
    </Stack>
  );
};
