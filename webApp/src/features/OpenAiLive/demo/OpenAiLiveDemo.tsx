'use client';
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Checkbox, FormControlLabel, Stack, Typography, Link } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useAuth } from '@/features/Auth/useAuth';
import { AuthWall } from '@/features/Auth/AuthWall';
import { supportedLanguages, SupportedLanguage } from '@/features/Lang/lang';
import { getUrlStart, getLandingUrlStart } from '@/features/Lang/getUrlStart';
import { DemoLanguageCards } from './DemoLanguageCards';
import { Mic, ArrowRight } from 'lucide-react';
import { OpenAiLiveCall } from '../OpenAiLiveCall';
import { formatElapsedMs } from '../formatBalance';
import { useDemoCall } from './useDemoCall';
import { LiveTranscriptLine } from '../transcripts';
import { demoRequest } from './api';

export const OpenAiLiveDemo = ({ pageLanguage = 'en' }: { pageLanguage?: SupportedLanguage }) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const call = useDemoCall();
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [consent, setConsent] = useState(false);
  const startedRef = useRef(false);
  const startConversation = () => {
    startedRef.current = true;
    setConsent(true);
    void call.start(language);
  };
  const [savedLines, setSavedLines] = useState<LiveTranscriptLine[]>([]);
  const [used, setUsed] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [join, setJoin] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void demoRequest<{ used: boolean; language: SupportedLanguage; lines: LiveTranscriptLine[] }>()
      .then((status) => {
        if (cancelled || startedRef.current) return;
        setUsed(status.used);
        setSavedLines(status.lines ?? []);
        if (supportedLanguages.includes(status.language)) setLanguage(status.language);
      })
      .catch(() => {
        if (!cancelled && !startedRef.current)
          setStatusError('Could not connect. Please reload to try again.');
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const reviewLines = call.lines.length ? call.lines : savedLines;
  const ended = used || call.phase === 'ended';
  return (
    <Stack
      component="main"
      data-testid="demo-page"
      sx={{
        minHeight: '100dvh',
        alignItems: 'center',
        px: 3,
        pt: { xs: 4, md: 9 },
        pb: !ended && !join ? 'calc(160px + env(safe-area-inset-bottom))' : 6,
        background: 'radial-gradient(ellipse at top, #30204c, #08080c 75%)',
        color: '#fff',
      }}
    >
      <Stack sx={{ width: '100%', maxWidth: 640, gap: 3 }}>
        <Typography variant="overline">FluencyPal · {i18n._('Speaking practice')}</Typography>
        <Typography
          component="h1"
          sx={{ fontSize: { xs: 36, md: 56 }, lineHeight: 1.1, fontWeight: 700 }}
        >
          {ended
            ? i18n._('Your next conversation starts here.')
            : i18n._('A little conversation. A lot more confidence.')}
        </Typography>
        <Typography sx={{ fontSize: 20, opacity: 0.8 }}>
          {ended
            ? i18n._('Join FluencyPal to build a speaking habit and keep your progress.')
            : i18n._(
                'Talk with a friendly AI teacher for three minutes. No account. No card. Just you and a conversation.',
              )}
        </Typography>
        {call.error || statusError ? (
          <Alert severity="error">{call.error || statusError}</Alert>
        ) : null}
        {!ended && !join ? (
          <>
            <DemoLanguageCards language={language} onChange={setLanguage} />
            <Typography>
              {i18n._(
                'Your teacher will start with an easy question. The timer begins when you connect, and we will let you know when 30 seconds remain.',
              )}
            </Typography>
            <Stack sx={{ gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox checked={consent} onChange={(_, checked) => setConsent(checked)} />
                }
                label={
                  <span>
                    {i18n._('I am 13 or older and agree to the')}{' '}
                    <Link
                      href={`${getLandingUrlStart(pageLanguage)}terms`}
                      target="_blank"
                      rel="noopener"
                    >
                      {i18n._('Terms of Use')}
                    </Link>{' '}
                    {i18n._('and')}{' '}
                    <Link
                      href={`${getLandingUrlStart(pageLanguage)}privacy`}
                      target="_blank"
                      rel="noopener"
                    >
                      {i18n._('Privacy Policy')}
                    </Link>
                    .{' '}
                    {i18n._(
                      'My voice is processed by AI and my transcript is saved for this practice session.',
                    )}
                  </span>
                }
              />
            </Stack>
            <Typography variant="body2" sx={{ opacity: 0.65 }}>
              {i18n._(
                'Microphone access is requested only when you start. After the demo, create an account to explore FluencyPal. Continued AI speaking uses credits; paid options are available.',
              )}
            </Typography>
          </>
        ) : null}
        {ended && !join ? (
          <Button variant="contained" size="large" onClick={() => setJoin(true)}>
            {auth.isIdentified ? i18n._('Continue to FluencyPal') : i18n._('Create my account')}
          </Button>
        ) : null}
        {join ? (
          <AuthWall
            startOnAuth
            signInTitle={i18n._('Keep the conversation going')}
            singInSubTitle={i18n._(
              'Create an account to save your progress. Continued AI speaking uses credits.',
            )}
          >
            <Button variant="contained" href={`${getUrlStart(pageLanguage)}practice`}>
              {i18n._('Open my practice dashboard')}
            </Button>
          </AuthWall>
        ) : null}
        <Button href={`${getUrlStart(pageLanguage)}quiz`} variant="text">
          {i18n._('Create my learning plan instead')}
        </Button>
        {reviewLines.length > 0 && ended ? (
          <Stack sx={{ gap: 1, mt: 2 }}>
            <Typography component="h2" variant="h5">
              {i18n._('Your conversation')}
            </Typography>
            <Typography variant="body2">
              {i18n._(
                'Review what you practiced. Your teacher’s suggestions appear in the conversation below.',
              )}
            </Typography>
            {reviewLines.map((line) => (
              <Typography
                key={line.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: line.role === 'user' ? '#28233b' : '#15131d',
                }}
              >
                <strong>{line.role === 'user' ? i18n._('You') : 'Marin'}: </strong>
                {line.text}
              </Typography>
            ))}
          </Stack>
        ) : null}
      </Stack>
      {!ended && !join && call.phase === 'idle' ? (
        <Stack
          data-testid="demo-start-bar"
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
            alignItems: 'center',
            px: 3,
            pt: 2,
            pb: 'calc(16px + env(safe-area-inset-bottom))',
            background: 'rgba(14, 11, 21, .96)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(211,183,255,.12)',
            boxShadow: '0 -12px 40px rgba(8,8,12,.35)',
          }}
        >
          <Stack sx={{ width: '100%', maxWidth: 640, gap: 1 }}>
            <Button
              variant="contained"
              size="large"
              onClick={startConversation}
              data-testid="demo-start"
              startIcon={<Mic size={19} />}
              endIcon={<ArrowRight size={19} />}
              sx={{
                minHeight: 56,
                borderRadius: '16px',
                textTransform: 'none',
                fontSize: 16,
                fontWeight: 700,
                background: '#d5b7ff',
                color: '#21122f',
                boxShadow: '0 4px 24px rgba(173,115,245,.16)',
                '&:hover': { background: '#e2ceff' },
                '&.Mui-disabled': { background: '#332a40', color: '#afa2be' },
              }}
            >
              {i18n._('Start my free conversation')}
            </Button>
            <Typography sx={{ textAlign: 'center', fontSize: 12, color: '#b8abc7' }}>
              {i18n._('3 minutes free · No account or card needed')}
            </Typography>
          </Stack>
        </Stack>
      ) : null}
      {call.phase === 'connecting' || call.phase === 'live' ? (
        <OpenAiLiveCall
          showStatus
          title={
            call.remaining <= 30_000
              ? i18n._('30 seconds left — one last thought')
              : i18n._('Your free conversation')
          }
          muted={call.muted}
          lines={call.lines}
          elapsedLabel={`${formatElapsedMs(call.remaining)} ${i18n._('left')}`}
          balanceUsd=""
          error={call.error}
          phase={call.phase}
          needsUnlock={call.needsUnlock}
          onToggleMute={call.toggleMute}
          onClose={() => call.end()}
          onUnlockAudio={call.unlock}
        />
      ) : null}
    </Stack>
  );
};
