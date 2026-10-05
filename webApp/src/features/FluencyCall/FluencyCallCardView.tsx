'use client';

import { ReactNode } from 'react';
import { Check, MessageSquare, Plus, Users } from 'lucide-react';
import { Badge, Box, Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { SupportedLanguage } from '@/features/Lang/lang';
import { FluencyCallLanguageSelect } from './FluencyCallLanguageSelect';
import { GoogleMeetIcon } from './GoogleMeetIcon';

const cardSx = {
  position: 'relative',
  isolation: 'isolate',
  overflow: 'hidden',
  containerType: 'inline-size',
  containerName: 'fluency-call-card',
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

const narrowButtonSx = {
  maxWidth: '100%',
  minWidth: 0,
  flexShrink: 1,
  whiteSpace: 'normal',
  textAlign: 'left',
  height: 'auto',
};

const narrowCall = '@container fluency-call (max-width: 520px)';

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
        minWidth: 0,
        padding: '14px 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        [narrowCall]: {
          display: 'grid',
          gridTemplateColumns: '52px minmax(0, 1fr)',
          columnGap: '12px',
          rowGap: '12px',
        },
      }}
    >
      <Stack
        data-testid={`fluency-call-date-${callId}`}
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
            whiteSpace: 'nowrap',
            maxWidth: '100%',
          }}
        >
          {month}
        </Typography>
        <Typography sx={{ fontSize: '22px', fontWeight: 700, lineHeight: 1 }}>{day}</Typography>
      </Stack>

      <Stack sx={{ flex: '1 1 140px', minWidth: 0, gap: '4px' }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, minWidth: 0 }}>{title}</Typography>
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
        <Stack direction="row" sx={{ alignItems: 'center', gap: '6px', minWidth: 0, opacity: 0.7 }}>
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

      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          gap: '8px',
          marginLeft: 'auto',
          flexShrink: 0,
          [narrowCall]: {
            gridColumn: '1 / -1',
            gridRow: 2,
            marginLeft: 0,
            minWidth: 0,
            maxWidth: '100%',
            flexWrap: 'wrap',
          },
        }}
      >
        <Badge
          color="error"
          badgeContent={unreadCount > 0 ? unreadCount : undefined}
          invisible={unreadCount < 1}
          data-testid={`fluency-call-unread-${callId}`}
        >
          <Button
            variant="outlined"
            data-testid={`fluency-call-show-chat-${callId}`}
            data-analytics="community-call-chat"
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
            data-analytics="community-call-meet"
            onClick={onOpenCall}
            sx={{ ...outlineButtonSx, [narrowCall]: narrowButtonSx }}
          >
            {i18n._('Join')}
          </Button>
        ) : (
          <Button
            variant="outlined"
            data-testid={`fluency-call-join-${callId}`}
            data-analytics="community-call-rsvp"
            aria-pressed={isJoining}
            disabled={isJoinPending}
            onClick={onToggleJoin}
            startIcon={isJoining ? <Check size={16} /> : <Plus size={16} />}
            sx={{
              ...outlineButtonSx,
              ...(isJoining ? { backgroundColor: 'rgba(183, 212, 232, 0.12)' } : {}),
              [narrowCall]: narrowButtonSx,
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
  languageCode: SupportedLanguage;
  requestedAtLabel: string | null;
  paidNotice: boolean;
  practiceNote?: string | null;
  timeZoneLabel: string;
  onLanguageChange: (language: SupportedLanguage) => void;
  onInitiateCall: () => void;
  onGetAccess: () => void;
  children?: ReactNode;
};

export const FluencyCallCardView = ({
  hasCalls,
  canJoin,
  languageCode,
  requestedAtLabel,
  paidNotice,
  practiceNote,

  timeZoneLabel,
  onLanguageChange,
  onInitiateCall,
  onGetAccess,
  children,
}: FluencyCallCardViewProps) => {
  const { i18n } = useLingui();
  const hasRequest = Boolean(requestedAtLabel);

  return (
    <Stack id="fluency-call" data-testid="fluency-call-card" sx={cardSx}>
      {practiceNote ? (
        <Typography
          data-testid="fluency-call-practice-until"
          sx={{ color: '#7DDEAA', fontWeight: 700 }}
        >
          {practiceNote}
        </Typography>
      ) : null}
      <Stack
        direction="row"
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}
      >
        <Stack direction="row" sx={{ alignItems: 'flex-start', gap: '12px', minWidth: 0 }}>
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
          <Stack sx={{ gap: '2px', minWidth: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {i18n._('Group conversations')}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Google Meet
            </Typography>
          </Stack>
        </Stack>
        <FluencyCallLanguageSelect
          value={languageCode}
          onChange={onLanguageChange}
          testId="fluency-call-language-filter"
          collapseLabel
        />
      </Stack>

      <Typography sx={{ opacity: 0.75, padding: '14px 0' }}>
        {i18n._('Practise speaking with other learners.')}
        <br />
        {i18n._('Join the conversations that fit your week.')}
      </Typography>

      {paidNotice ? (
        <Stack sx={{ gap: '4px' }}>
          <Typography data-testid="fluency-call-paid" sx={{ color: '#7DDEAA', fontWeight: 700 }}>
            {canJoin
              ? i18n._('Payment received. You can join the group conversations.')
              : i18n._('Payment received. You can join in a moment.')}
          </Typography>
          <Typography sx={{ color: '#7DDEAA' }}>
            {i18n._('Talk with AI until the call starts.')}
          </Typography>
        </Stack>
      ) : null}

      {hasCalls ? (
        <Stack sx={{ containerType: 'inline-size', containerName: 'fluency-call', minWidth: 0 }}>
          <Stack
            direction="row"
            sx={{
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: '12px',
              paddingTop: '4px',
              [narrowCall]: {
                flexWrap: 'wrap',
                gap: '4px 12px',
              },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {i18n._('Upcoming conversations')}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                opacity: 0.55,
                [narrowCall]: { marginLeft: 'auto', textAlign: 'right' },
              }}
            >
              {i18n._('All times in {zone}', { zone: timeZoneLabel })}
            </Typography>
          </Stack>
          {children}
        </Stack>
      ) : null}

      {!hasCalls || canJoin ? (
        <Stack sx={{ gap: '12px' }}>
          {canJoin && hasRequest ? (
            <Stack data-testid="fluency-call-request-sent" sx={{ gap: '6px' }}>
              <Typography sx={{ fontWeight: 800, color: '#7DDEAA' }}>
                {i18n._('Request sent')}
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{requestedAtLabel}</Typography>
              <Typography sx={{ opacity: 0.8 }}>{i18n._("We'll reply soon.")}</Typography>
            </Stack>
          ) : null}

          {!hasCalls && !(canJoin && hasRequest) ? (
            <Stack sx={{ gap: '6px' }}>
              <Typography sx={{ fontWeight: 700 }}>
                {i18n._('No conversation scheduled yet.')}
              </Typography>
              {canJoin ? (
                <Typography>{i18n._("Pick a time and we'll set one up.")}</Typography>
              ) : null}
            </Stack>
          ) : null}

          {canJoin && !hasRequest ? (
            <Button
              variant="outlined"
              data-testid="fluency-call-initiate"
              data-analytics="community-call-propose"
              onClick={onInitiateCall}
              startIcon={<Plus size={16} />}
              sx={{ ...outlineButtonSx, alignSelf: 'flex-start' }}
            >
              {i18n._('Propose a conversation')}
            </Button>
          ) : null}

          {canJoin && hasRequest ? (
            <Button
              variant="outlined"
              data-testid="fluency-call-change-time"
              data-analytics="community-call-change-time"
              onClick={onInitiateCall}
              sx={{ ...outlineButtonSx, alignSelf: 'flex-start' }}
            >
              {i18n._('Change time')}
            </Button>
          ) : null}

          {!canJoin && !hasCalls ? (
            <Button
              variant="outlined"
              data-testid="fluency-call-get-access"
              data-analytics="community-call-buy"
              onClick={onGetAccess}
              sx={{ ...outlineButtonSx, alignSelf: 'flex-start' }}
            >
              {i18n._('$2 per month')}
            </Button>
          ) : null}
        </Stack>
      ) : null}
    </Stack>
  );
};
