'use client';

import { useEffect, useState } from 'react';
import { Button, CircularProgress, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Mic } from 'lucide-react';
import { useSettings } from '../Settings/useSettings';
import { isMicrophoneDenied } from '@/libs/mic';
import { voiceAvatarMap } from './CallMode/voiceAvatar';
import { ENABLE_MIC_JUST_TALK_ANALYTICS_ID } from './justTalkHandoff';
import { sendUiError } from '@/features/Analytics/Custom/sendOutcomeEvents';

export const JustTalkHandoffScreen = ({
  onEnableMic,
  isStarting,
  wasDenied = false,
}: {
  onEnableMic: () => void | Promise<unknown>;
  isStarting: boolean;
  wasDenied?: boolean;
}) => {
  const { i18n } = useLingui();
  const settings = useSettings();
  const [permissionDenied, setPermissionDenied] = useState(wasDenied);
  const voiceName = settings.voice;
  const photoUrl = voiceAvatarMap[voiceName]?.photoUrls?.[0] || '';

  useEffect(() => {
    if (wasDenied) {
      setPermissionDenied(true);
      sendUiError('mic_denied');
      return;
    }
    void isMicrophoneDenied().then((denied) => {
      if (denied) {
        setPermissionDenied(true);
        sendUiError('mic_denied');
      }
    });
  }, [wasDenied]);

  return (
    <Stack
      data-testid="just-talk-handoff"
      data-analytics-screen="practice.justTalkHandoff"
      sx={{
        width: '100%',
        minHeight: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px 16px',
        boxSizing: 'border-box',
      }}
    >
      <Stack
        sx={{
          width: '100%',
          maxWidth: '520px',
          gap: '28px',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt=""
            width={120}
            height={120}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Stack
            sx={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 166, 255, 1)',
            }}
          >
            <Mic size={44} color="#fff" strokeWidth={2.2} />
          </Stack>
        )}

        <Stack sx={{ gap: '12px' }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              color: '#fff',
            }}
          >
            {i18n._('Enable microphone to start talking')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.78)',
              lineHeight: 1.6,
            }}
          >
            {i18n._(
              'Your teacher is ready. Allow the microphone so you can start the conversation — we only use it for this practice session.',
            )}
          </Typography>
        </Stack>

        {permissionDenied && (
          <Stack
            sx={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(244, 67, 54, 0.12)',
              border: '1px solid rgba(244, 67, 54, 0.35)',
              textAlign: 'left',
            }}
          >
            <Typography variant="body2" sx={{ color: '#ff8a80', lineHeight: 1.5 }}>
              {i18n._(
                'Microphone access was blocked. Open your browser settings, allow microphone access for this site, then tap Enable microphone again.',
              )}
            </Typography>
          </Stack>
        )}

        <Button
          variant="contained"
          color="info"
          size="large"
          fullWidth
          disabled={isStarting}
          data-analytics={ENABLE_MIC_JUST_TALK_ANALYTICS_ID}
          startIcon={
            isStarting ? <CircularProgress size={18} color="inherit" /> : <Mic size={18} />
          }
          onClick={() => {
            void Promise.resolve(onEnableMic()).then((result) => {
              if (result === 'mic-denied') {
                setPermissionDenied(true);
                sendUiError('mic_denied');
              }
            });
          }}
          sx={{
            padding: '14px 20px',
            fontWeight: 700,
            fontSize: '1rem',
          }}
        >
          {isStarting ? i18n._('Starting...') : i18n._('Enable microphone to start talking')}
        </Button>
      </Stack>
    </Stack>
  );
};
