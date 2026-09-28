'use client';

import { useState } from 'react';
import { CircularProgress, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Mic } from 'lucide-react';
import { InfoStep } from '../../Survey/InfoStep';
import { requestMicrophoneAccess } from '@/libs/mic';
import { sendPermission, sendUiError } from '@/features/Analytics/Custom/sendOutcomeEvents';
import { getLandingUrlStart } from '@/features/Lang/getUrlStart';

export const QuizRecordingConsentStep = ({
  pageLanguage,
  onContinue,
  isStepLoading,
}: {
  pageLanguage: string;
  onContinue: () => void;
  isStepLoading: boolean;
}) => {
  const { i18n } = useLingui();
  const policyBase = getLandingUrlStart(pageLanguage);

  return (
    <Stack data-testid="quiz-recording-consent" data-analytics-screen="quiz.recordingConsent">
      <InfoStep
        title={i18n._('Before you record your voice')}
        subTitle={i18n._(
          'We record your voice so the teacher can hear you. You need to be at least 13 years old to use FluencyPal.',
        )}
        listItems={[
          {
            title: i18n._('You confirm that you are at least 13 years old'),
            iconName: 'shield-check',
          },
          {
            title: i18n._('Privacy Policy'),
            iconName: 'scroll-text',
            href: `${policyBase}privacy`,
          },
          {
            title: i18n._('Terms of Use'),
            iconName: 'pencil-ruler',
            href: `${policyBase}terms`,
          },
        ]}
        actionButtonTitle={i18n._('I agree')}
        actionButtonAnalyticsId="quiz-voice-consent"
        onClick={onContinue}
        disabled={isStepLoading}
        isStepLoading={isStepLoading}
      />
    </Stack>
  );
};

export const QuizMicPermissionStep = ({
  onContinue,
  isStepLoading,
}: {
  onContinue: () => void;
  isStepLoading: boolean;
}) => {
  const { i18n } = useLingui();
  const [isRequesting, setIsRequesting] = useState(false);
  const [wasDenied, setWasDenied] = useState(false);

  const onAllow = async () => {
    if (isRequesting) return;
    setIsRequesting(true);
    sendPermission({ kind: 'mic', state: 'prompt' });
    const granted = await requestMicrophoneAccess();
    setIsRequesting(false);
    if (granted) {
      onContinue();
      return;
    }
    setWasDenied(true);
    sendUiError('mic_denied');
  };

  return (
    <Stack data-testid="quiz-mic-permission" data-analytics-screen="quiz.micPermission">
      <InfoStep
        title={i18n._('Allow the microphone')}
        subTitle={i18n._('Your browser will ask for the microphone. Tap Allow.')}
        listItems={[
          {
            title: i18n._('We use the microphone only to hear you practice'),
            iconName: 'lock',
          },
        ]}
        actionButtonTitle={
          isRequesting ? i18n._('Requesting access...') : i18n._('Allow microphone')
        }
        actionButtonAnalyticsId="mic-permission-grant"
        actionButtonStartIcon={
          isRequesting ? <CircularProgress size={18} color="inherit" /> : <Mic size={18} />
        }
        onClick={() => {
          void onAllow();
        }}
        disabled={isStepLoading || isRequesting}
        isStepLoading={isStepLoading || isRequesting}
        subComponent={
          wasDenied ? (
            <Stack
              data-testid="quiz-mic-denied"
              sx={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(244, 67, 54, 0.12)',
                border: '1px solid rgba(244, 67, 54, 0.35)',
              }}
            >
              <Typography variant="body2" sx={{ color: '#ff8a80', lineHeight: 1.5 }}>
                {i18n._(
                  'Microphone access was blocked. Open your browser settings, allow microphone access for this site, then tap Allow microphone again.',
                )}
              </Typography>
            </Stack>
          ) : null
        }
      />
    </Stack>
  );
};
