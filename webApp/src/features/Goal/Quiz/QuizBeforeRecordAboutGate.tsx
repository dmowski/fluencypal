'use client';

import { useEffect, useRef, useState } from 'react';
import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { AuthWall } from '@/features/Auth/AuthWall';
import { useAuth } from '@/features/Auth/useAuth';
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
    if (didAdvance.current || auth.loading || !auth.uid) {
      return;
    }
    didAdvance.current = true;
    setIsSaving(true);
    void Promise.resolve(onAdvance()).finally(() => {
      setIsSaving(false);
    });
  }, [auth.loading, auth.uid, onAdvance]);

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
  promptText,
  onSignedIn,
}: {
  languageCode: string;
  promptText: string;
  onSignedIn: () => void | Promise<void>;
}) => {
  const { i18n } = useLingui();
  const [isGuestRecording, setIsGuestRecording] = useState(false);
  const [hasGuestRecorded, setHasGuestRecorded] = useState(() => hasGuestAbout(languageCode));

  return (
    <AuthWall
      startOnAuth
      authListAfterActions
      signInTitle={i18n._('Tell me about yourself')}
      singInSubTitle={i18n._(
        `Let's talk a little about you. This will help me to create a practice plan. Why do you want to practice speaking?`,
      )}
      authActionTitle={i18n._('Continue to talk')}
      hideAuthActions={!hasGuestRecorded}
      authSubComponent={
        <Stack
          data-testid="quiz-guest-about-start"
          sx={{
            gap: '16px',
            marginTop: '8px',
          }}
        >
          <QuizRecordAboutPrompt text={promptText} pausePlayback={isGuestRecording} />
          <QuizGuestRecordAbout
            languageCode={languageCode}
            onRecordingChange={setIsGuestRecording}
            onHasRecorded={setHasGuestRecorded}
          />
        </Stack>
      }
    >
      <AdvanceWhenSignedIn onAdvance={onSignedIn} />
    </AuthWall>
  );
};
