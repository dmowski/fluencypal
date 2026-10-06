'use client';

import { useEffect, useState } from 'react';
import { Button, Skeleton, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { SafeGroupCall, toSafeGroupCalls } from './safeGroupCalls';

const part = (parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) =>
  parts.find((item) => item.type === type)?.value || '';

const localCallParts = (iso: string, locale: string, timeZone: string) => {
  const date = new Date(iso);
  const parts = new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  return {
    weekday: part(parts, 'weekday').replace(/\.$/u, '').toUpperCase(),
    day: part(parts, 'day'),
    time: `${part(parts, 'hour')}:${part(parts, 'minute')}`,
    live: date.getTime() <= Date.now(),
  };
};

const PLACEHOLDER_COUNT = 4;

const rowSx = {
  alignItems: 'center',
  gap: '12px',
  padding: '12px 0',
  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
};

const CallSkeleton = () => (
  <Stack direction="row" data-testid="group-conversations-schedule-skeleton" sx={rowSx}>
    <Skeleton
      variant="rounded"
      width={52}
      height={52}
      sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)', flexShrink: 0 }}
    />
    <Stack sx={{ gap: '8px' }}>
      <Skeleton width={72} height={18} sx={{ bgcolor: 'rgba(255, 255, 255, 0.12)' }} />
      <Skeleton width={140} height={14} sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)' }} />
    </Stack>
  </Stack>
);

export const GroupConversationSchedule = ({ moreHref }: { moreHref: string }) => {
  const { i18n } = useLingui();
  const [calls, setCalls] = useState<SafeGroupCall[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch('/api/group-conversations/schedule');
        if (!response.ok) throw new Error('schedule unavailable');
        const next = toSafeGroupCalls(await response.json()).filter(
          (call) => call.languageCode === 'en',
        );
        if (!cancelled) setCalls(next);
      } catch {
        if (!cancelled) setFailed(true);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const loading = calls === null && !failed;
  const englishCalls = (calls ?? []).slice(0, PLACEHOLDER_COUNT);

  return (
    <Stack
      data-testid="group-conversations-schedule"
      sx={{
        gap: '4px',
        padding: '22px',
        borderRadius: '20px',
        border: '1px solid rgba(148, 145, 255, 0.22)',
        backgroundColor: '#16181e',
        boxShadow: '0 12px 45px #00000040',
      }}
    >
      <Typography sx={{ fontWeight: 800, fontSize: '1.15rem' }}>
        {i18n._('Upcoming calls')}
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.65 }}>
        {i18n._('Times are shown in your local time zone.')}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: '#7DDEAA', paddingBottom: '8px' }}>
        {i18n._('Free for everyone.')}
      </Typography>
      {failed ? (
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          {i18n._('The schedule is not available right now.')}
        </Typography>
      ) : null}
      {calls && englishCalls.length === 0 ? (
        <Typography
          variant="body2"
          data-testid="group-conversations-schedule-empty"
          sx={{ opacity: 0.75 }}
        >
          {i18n._('No English calls yet. New times will show up here.')}
        </Typography>
      ) : null}
      {loading
        ? Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => <CallSkeleton key={index} />)
        : null}
      {englishCalls.map((call) => {
        const label = localCallParts(call.startsAtIso, i18n.locale || 'en', timeZone);
        return (
          <Stack
            key={call.id}
            direction="row"
            data-testid="group-conversations-schedule-row"
            sx={rowSx}
          >
            <Stack
              sx={{
                width: 52,
                height: 52,
                borderRadius: '12px',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                flexShrink: 0,
              }}
            >
              <Typography sx={{ fontSize: '11px', fontWeight: 700 }}>{label.weekday}</Typography>
              <Typography sx={{ fontSize: '18px', fontWeight: 800, lineHeight: 1 }}>
                {label.day}
              </Typography>
            </Stack>
            <Stack sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700 }}>
                {label.live ? i18n._('Now · {time}', { time: label.time }) : label.time}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                {call.joinCount === 1
                  ? i18n._('English · 1 person')
                  : call.joinCount > 1
                    ? i18n._('English · {count} people', { count: call.joinCount })
                    : i18n._('English')}
              </Typography>
            </Stack>
          </Stack>
        );
      })}
      <Button
        variant="outlined"
        disabled={loading}
        href={loading ? undefined : moreHref}
        data-analytics={loading ? undefined : 'community-call-schedule-more'}
        data-testid="group-conversations-show-more"
        sx={{
          marginTop: '8px',
          alignSelf: 'stretch',
          color: '#f4f7fb',
          borderColor: 'rgba(255, 255, 255, 0.16)',
          textTransform: 'none',
          fontWeight: 700,
          '&.Mui-disabled': {
            color: 'rgba(244, 247, 251, 0.35)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          },
        }}
      >
        {i18n._('Show more')}
      </Button>
    </Stack>
  );
};
