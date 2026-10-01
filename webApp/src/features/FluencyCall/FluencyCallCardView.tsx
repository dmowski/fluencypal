'use client';
import { Lock, Square, SquareCheck, MessageSquare, ArrowRight } from 'lucide-react';
import { Badge, Box, Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { CallCountdown } from './types';
import { CommunityCallsHeader } from './CommunityCallsHeader';

export type FluencyCallCardViewProps = {
  startsAtLabel: string;
  countdown: CallCountdown;
  isMember: boolean;
  membershipReady: boolean;
  isJoining: boolean;
  joinCount: number;
  canOpenCall: boolean;
  isJoinPending: boolean;
  onToggleJoin: () => void;
  onShowChat: () => void;
  unreadCount: number;
  onJoinMembership: () => void;
  onOpenCall: () => void;
};

export const FluencyCallCardView = ({
  startsAtLabel,
  countdown,
  isMember,
  membershipReady,
  isJoining,
  joinCount,
  canOpenCall,
  isJoinPending,
  onToggleJoin,
  onShowChat,
  unreadCount,
  onJoinMembership,
  onOpenCall,
}: FluencyCallCardViewProps) => {
  const { i18n } = useLingui();
  const underAMinute = countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0;
  const units = underAMinute
    ? [
        { value: countdown.hours, label: i18n._('hours') },
        { value: countdown.minutes, label: i18n._('minutes') },
        { value: countdown.seconds, label: i18n._('seconds') },
      ]
    : [
        { value: countdown.days, label: i18n._('days') },
        { value: countdown.hours, label: i18n._('hours') },
        { value: countdown.minutes, label: i18n._('minutes') },
      ];

  return (
    <Stack
      data-testid="fluency-call-card"
      sx={{
        gap: '16px',
        padding: '20px',
        borderRadius: '16px',
        backgroundColor: '#1c1e24',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <CommunityCallsHeader />
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        {startsAtLabel && (
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {startsAtLabel}
          </Typography>
        )}
      </Stack>

      {countdown.isLive ? (
        <Stack
          data-testid="fluency-call-live"
          direction="row"
          sx={{
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#7DDEAA',
            }}
          >
            {i18n._('Happening now')}
          </Typography>
          <Box
            sx={{
              width: 8,
              height: 8,
              marginTop: '3px',
              borderRadius: '50%',
              backgroundColor: '#7DDEAA',
              flexShrink: 0,
              animation: 'fluencyCallLivePulse 1.4s ease-in-out infinite',
              '@keyframes fluencyCallLivePulse': {
                '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                '50%': { opacity: 0.8, transform: 'scale(0.9)' },
              },
            }}
          />
        </Stack>
      ) : (
        <Stack
          data-testid="fluency-call-countdown"
          direction="row"
          sx={{
            gap: '10px',
          }}
        >
          {units.map((unit) => (
            <Stack
              key={unit.label}
              sx={{
                flex: 1,
                alignItems: 'center',
                gap: '4px',
                padding: '14px 8px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {unit.value}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.7,
                }}
              >
                {unit.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}

      {membershipReady && !isMember && (
        <Typography
          data-testid="fluency-call-members-label"
          variant="body2"
          sx={{
            fontWeight: 700,
            color: '#E7C27D',
          }}
        >
          {i18n._('FluencyPal Calls are only for members')}
        </Typography>
      )}

      {membershipReady && isMember ? (
        <Stack
          direction="row"
          sx={{
            gap: '10px',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          {membershipReady && isMember && canOpenCall ? (
            <Button
              variant="contained"
              size="large"
              color="success"
              data-testid="fluency-call-open"
              onClick={onOpenCall}
              endIcon={<ArrowRight size={20} />}
            >
              {i18n._('Join the call')}
            </Button>
          ) : (
            <Stack
              sx={{
                gap: '10px',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Button
                variant={isJoining ? 'contained' : 'outlined'}
                color={'info'}
                data-testid="fluency-call-join"
                aria-pressed={isJoining}
                disabled={isJoinPending}
                onClick={onToggleJoin}
                startIcon={isJoining ? <SquareCheck size={20} /> : <Square size={20} />}
              >
                {i18n._('I will join')}
              </Button>

              <Typography
                component="span"
                data-testid="fluency-call-join-count"
                sx={{
                  fontWeight: 400,
                  opacity: 0.7,
                  textAlign: 'center',
                  color: '#fff',
                  fontSize: '14px',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                +{joinCount}
              </Typography>
            </Stack>
          )}

          <Badge
            color="error"
            badgeContent={unreadCount > 0 ? unreadCount : undefined}
            invisible={unreadCount < 1}
            data-testid="fluency-call-unread"
          >
            <Button
              variant="text"
              color={'info'}
              data-testid="fluency-call-show-chat"
              onClick={onShowChat}
              startIcon={<MessageSquare size={20} />}
            >
              {i18n._('Show chat')}
            </Button>
          </Badge>
        </Stack>
      ) : null}

      {membershipReady && !isMember && (
        <Button
          variant="contained"
          color="success"
          data-testid="fluency-call-join-membership"
          data-analytics="buy-access"
          onClick={onJoinMembership}
          sx={{
            backgroundColor: 'rgba(135, 31, 156, 0.53)',
            color: '#fad2fe',
            fontWeight: 600,
            borderRadius: '20px',
          }}
          startIcon={<Lock size={20} color="#F8BCFF" />}
        >
          {i18n._('Join membership')}
        </Button>
      )}
    </Stack>
  );
};
