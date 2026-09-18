'use client';

import { useState } from 'react';
import { CircularProgress, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Mic } from 'lucide-react';
import { InfoStep } from '../../Survey/InfoStep';
import { requestMicrophoneAccess } from '@/libs/mic';
import { sendPermission, sendUiError } from '@/features/Analytics/Custom/sendOutcomeEvents';

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

  const onAllowMicrophone = async () => {
    if (isRequesting) {
      return;
    }
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
    <InfoStep
      title={i18n._('Allow your microphone')}
      subTitle={i18n._('So you can speak your answer and talk with the teacher')}
      listItems={[
        {
          title: i18n._('You will record a short answer about why you want to practice'),
          iconName: 'mic',
        },
        {
          title: i18n._('Your browser will ask for permission. Tap Allow'),
          iconName: 'shield-check',
        },
        {
          title: i18n._('We use the microphone only to hear you in this session'),
          iconName: 'lock',
        },
      ]}
      actionButtonTitle={isRequesting ? i18n._('Requesting access...') : i18n._('Allow microphone')}
      actionButtonAnalyticsId="mic-permission-grant"
      actionButtonStartIcon={
        isRequesting ? <CircularProgress size={18} color="inherit" /> : <Mic size={18} />
      }
      onClick={() => {
        void onAllowMicrophone();
      }}
      disabled={isStepLoading || isRequesting}
      isStepLoading={isStepLoading || isRequesting}
      subComponent={
        <Stack data-testid="quiz-mic-permission" data-analytics-screen="quiz.micPermission">
          {wasDenied ? (
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
          ) : null}
        </Stack>
      }
    />
  );
};
