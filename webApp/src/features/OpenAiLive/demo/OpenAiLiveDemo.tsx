'use client';
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Stack, Typography, Link } from '@mui/material';
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
import { DemoAurora } from './DemoAurora';
import { AuroraMode } from './aurora';

const demoAuroraMode = (
  phase: 'idle' | 'connecting' | 'live' | 'ended',
  muted: boolean,
  latest: LiveTranscriptLine | undefined,
): AuroraMode => {
  if (phase === 'connecting') return 'thinking';
  if (phase === 'live' && latest && !latest.closed && latest.role === 'assistant') return 'alex';
  if (phase === 'live' && muted) return 'muted';
  if (phase === 'live' && latest && !latest.closed) return 'you';
  if (phase === 'live') return 'listening';
  return 'idle';
};

export const OpenAiLiveDemo = ({ pageLanguage = 'en' }: { pageLanguage?: SupportedLanguage }) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const call = useDemoCall();
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const startedRef = useRef(false);
  const startConversation = () => {
    startedRef.current = true;
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
  const inCall = call.phase === 'connecting' || call.phase === 'live';
  const showStartBar = !ended && !join && call.phase === 'idle';
  const auroraMode = demoAuroraMode(call.phase, call.muted, call.lines[call.lines.length - 1]);
  return (
    <Stack
      component="main"
      data-testid="demo-page"
      sx={{
        minHeight: '100dvh',
        alignItems: 'center',
        px: 3,
        pb: 6,
        background: 'radial-gradient(ellipse at top, #30204c, #08080c 75%)',
        color: '#fff',
        paddingTop: !inCall && !ended ? '120px' : '20px',
        '@media (max-height: 600px)': {
          paddingTop: '20px',
        },
      }}
    >
      {inCall || showStartBar ? null : <DemoAurora mode={auroraMode} />}
      <Stack sx={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 640, gap: 3 }}>
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
        {!ended && !join ? <DemoLanguageCards language={language} onChange={setLanguage} /> : null}
        {ended && !join ? (
          <Button
            variant="contained"
            color="info"
            endIcon={<ArrowRight size={19} />}
            sx={{
              padding: '12px 16px',
              width: 'max-content',
            }}
            size="large"
            onClick={() => setJoin(true)}
          >
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

        {reviewLines.length > 0 && ended ? (
          <Stack sx={{ gap: 1, mt: 2 }}>
            <Typography component="h2" variant="h5" sx={{ fontWeight: 700 }}>
              {i18n._('Your conversation')}
            </Typography>
            <Typography sx={{ fontSize: 16, opacity: 0.8 }}>
              {i18n._(
                'Review what you practiced. Your teacher’s suggestions appear in the conversation below.',
              )}
            </Typography>
            <Stack
              sx={{
                borderRadius: '3px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {reviewLines.map((line) => (
                <Stack
                  key={line.id}
                  sx={{
                    padding: '12px 16px',
                    backgroundColor: line.role === 'user' ? '#150F20' : '#191327',
                  }}
                >
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{ fontWeight: 700, opacity: 0.8 }}
                  >
                    {line.role === 'user' ? i18n._('You') : 'Marin'}:{' '}
                  </Typography>
                  <Typography component="span" sx={{ fontSize: 18, opacity: 0.8 }}>
                    {line.text}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        ) : null}
      </Stack>
      {showStartBar ? (
        <Stack
          data-testid="demo-start-bar"
          sx={{
            overflow: 'visible',
            bottom: '0px',
            alignItems: 'center',
            width: '100%',
            padding: '20px 0 10px 0',
          }}
        >
          <DemoAurora mode={auroraMode} placement="bar" />
          <Stack sx={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 640, gap: 1 }}>
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
                boxShadow: '0 4px 24px rgba(173,115,245,.16), 2px 2px 16px rgba(0,0,0,0.3)',
                '&:hover': { background: '#e2ceff' },
                '&.Mui-disabled': { background: '#332a40', color: '#afa2be' },
              }}
            >
              {i18n._('Start my free conversation')}
            </Button>
            <Typography sx={{ textAlign: 'center', fontSize: 12, color: '#b8abc7' }}>
              {i18n._('3 minutes free · No account or card needed')}
            </Typography>
            <Typography
              sx={{ textAlign: 'center', fontSize: 12, lineHeight: 1.45, color: '#b8abc7' }}
            >
              {[
                i18n._('By starting this call, you confirm you are 13 or older and agree to the'),
                ' ',
                <Link
                  key="terms"
                  href={`${getLandingUrlStart(pageLanguage)}terms`}
                  target="_blank"
                  rel="noopener"
                  sx={{ color: '#e2ceff' }}
                >
                  {i18n._('Terms of Use')}
                </Link>,
                ' ',
                i18n._('and'),
                ' ',
                <Link
                  key="privacy"
                  href={`${getLandingUrlStart(pageLanguage)}privacy`}
                  target="_blank"
                  rel="noopener"
                  sx={{ color: '#e2ceff' }}
                >
                  {i18n._('Privacy Policy')}
                </Link>,
                '. ',
                i18n._(
                  'Your voice is processed by AI and your transcript is saved for this practice session.',
                ),
              ]}
            </Typography>
          </Stack>
        </Stack>
      ) : null}
      {call.phase === 'connecting' || call.phase === 'live' ? (
        <OpenAiLiveCall
          glow={<DemoAurora mode={auroraMode} burstOnMount zIndex={-1} />}
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
