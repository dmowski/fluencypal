'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { SupportedLanguage, fullLanguageName } from '@/features/Lang/lang';
import { QuizPageLoader } from '@/features/Case/quiz/QuizPageLoader';
import { useAuth } from '@/features/Auth/useAuth';
import { fluencyCallLanguageCode } from './callLanguage';
import { fluencyCallRowTitle, formatCallLabel, timeZoneCity, viewerTimeZone } from './callTime';
import { useFluencyCallRsvps, useListedFluencyCalls } from './useFluencyCalls';
import { useNow } from './useNow';
import { FluencyCall } from './types';

const CallRow = ({ call, now }: { call: FluencyCall; now: Date }) => {
  const { i18n } = useLingui();
  const { joinCount } = useFluencyCallRsvps(call.id);
  const timeZone = viewerTimeZone();
  const label = formatCallLabel(call.startsAtIso, now, i18n.locale || 'en', timeZone);
  const live = new Date(call.startsAtIso).getTime() <= now.getTime();
  const title = label
    ? fluencyCallRowTitle(label, live, {
        today: i18n._('Today'),
        tomorrow: i18n._('Tomorrow'),
        now: i18n._('Now'),
      })
    : '';
  const language = fullLanguageName[fluencyCallLanguageCode(call.languageCode)];

  return (
    <Stack
      direction="row"
      data-testid={`community-call-scheduled-${call.id}`}
      sx={{
        alignItems: 'center',
        gap: '12px',
        padding: '12px 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
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
        }}
      >
        <Typography sx={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em' }}>
          {label?.month}
        </Typography>
        <Typography sx={{ fontSize: '18px', fontWeight: 800, lineHeight: 1 }}>
          {label?.day}
        </Typography>
      </Stack>
      <Stack sx={{ minWidth: 0, gap: '2px' }}>
        <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          {language}
          {joinCount > 0 ? ` · ${i18n._('{count} joined', { count: joinCount })}` : ''}
        </Typography>
      </Stack>
    </Stack>
  );
};

export const CommunityCallScheduleStep = ({
  language,
  onContinue,
}: {
  language: SupportedLanguage;
  onContinue: () => void;
}) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const now = useNow(15_000);
  const { calls, loading } = useListedFluencyCalls(now);
  const visible = calls.filter((call) => fluencyCallLanguageCode(call.languageCode) === language);
  const timeZoneLabel = timeZoneCity(viewerTimeZone());

  if (auth.loading || (auth.uid && loading)) {
    return <QuizPageLoader />;
  }

  return (
    <Stack data-testid="community-call-calls" sx={{ gap: '16px', width: '100%' }}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        {i18n._('Upcoming calls')}
      </Typography>
      <Typography sx={{ opacity: 0.75 }}>
        {i18n._('Times are shown in {zone}. You join from your dashboard.', {
          zone: timeZoneLabel,
        })}
      </Typography>
      {visible.length === 0 ? (
        <Typography data-testid="community-call-no-calls">
          {i18n._(
            'No upcoming {language} call right now. You can still continue. New calls show up on your dashboard.',
            { language: fullLanguageName[language] },
          )}
        </Typography>
      ) : (
        <Stack>
          {visible.map((call) => (
            <CallRow key={call.id} call={call} now={now} />
          ))}
        </Stack>
      )}
      <Button
        variant="contained"
        size="large"
        data-testid="community-call-next"
        data-analytics="community-call-calls-continue"
        onClick={onContinue}
        sx={{ alignSelf: 'flex-start', borderRadius: '30px', fontWeight: 700 }}
      >
        {i18n._('Continue')}
      </Button>
    </Stack>
  );
};
