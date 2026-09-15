'use client';

import { useEffect, useRef, useState } from 'react';
import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useAuth } from '@/features/Auth/useAuth';
import { InfoStep } from '../../Survey/InfoStep';
import { QuizGuestRecordAbout } from './QuizGuestRecordAbout';
import { QuizRecordAboutPrompt } from './QuizRecordAboutPrompt';
import { hasGuestAbout } from './quizGuestAboutStorage';

const AdvanceWhenSignedIn = ({
  onAdvance,
}: {
  onAdvance: () => void | Promise<void>;
}) => {
  const auth = useAuth();
  const { i18n } = useLingui();
  const didAdvance = useRef(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (didAdvance.current || auth.loading || !auth.isIdentified) {
      return;
    }
    didAdvance.current = true;
    setIsSaving(true);
    void Promise.resolve(onAdvance()).finally(() => {
      setIsSaving(false);
    });
  }, [auth.loading, auth.isIdentified, onAdvance]);

  if (!isSaving) {
    return null;
  }

  return (
    <Typography data-testid="quiz-guest-about-saving" variant="body1">
      {i18n._('Saving your answer…')}
    </Typography>
  );
};

export const QuizBeforeRecordAboutGate = ({
  languageCode,
  title,
  subTitle,
  promptText,
  onContinue,
}: {
  languageCode: string;
  title: string;
  subTitle: string;
  promptText: string;
  onContinue: () => void | Promise<void>;
}) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const [isGuestRecording, setIsGuestRecording] = useState(false);
  const [hasGuestRecorded, setHasGuestRecorded] = useState(() => hasGuestAbout(languageCode));
  const [readyToContinue, setReadyToContinue] = useState(() => hasGuestAbout(languageCode));
  const reactionText = i18n._("Thanks — I'll use that to make your plan. Let's keep going.");

  if (!auth.loading && auth.isIdentified) {
    return <AdvanceWhenSignedIn onAdvance={onContinue} />;
  }

  return (
    <InfoStep
      title={title}
      subTitle={hasGuestRecorded ? undefined : subTitle}
      hideActions={!readyToContinue}
      actionButtonTitle={i18n._('Continue')}
      actionButtonAnalyticsId="quiz-guest-continue"
      onClick={() => {
        void onContinue();
      }}
      subComponent={
        <Stack
          data-testid="quiz-guest-about-start"
          sx={{
            gap: '16px',
            marginTop: '8px',
          }}
        >
          {!hasGuestRecorded ? (
            <QuizRecordAboutPrompt
              text={promptText}
              pausePlayback={isGuestRecording}
              autoPlay
            />
          ) : null}
          <QuizGuestRecordAbout
            languageCode={languageCode}
            onRecordingChange={setIsGuestRecording}
            onHasRecorded={setHasGuestRecorded}
            onReadyToContinue={setReadyToContinue}
          />
          {readyToContinue ? (
            <QuizRecordAboutPrompt text={reactionText} autoPlay variant="reaction" />
          ) : null}
        </Stack>
      }
    />
  );
};
