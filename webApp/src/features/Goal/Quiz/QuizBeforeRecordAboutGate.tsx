'use client';

import { useState } from 'react';
import { Stack } from '@mui/material';
import { useLingui } from '@lingui/react';
import { InfoStep } from '../../Survey/InfoStep';
import { QuizGuestRecordAbout } from './QuizGuestRecordAbout';
import { QuizRecordAboutPrompt } from './QuizRecordAboutPrompt';
import { QuizGuestAboutRecording } from './quizGuestAboutStorage';

export const QuizBeforeRecordAboutGate = ({
  languageCode,
  title,
  subTitle,
  promptText,
  alreadySaved = false,
  onSaveRecording,
  onContinue,
}: {
  languageCode: string;
  title: string;
  subTitle: string;
  promptText: string;
  alreadySaved?: boolean;
  onSaveRecording: (recording: QuizGuestAboutRecording) => Promise<void>;
  onContinue: () => void | Promise<void>;
}) => {
  const { i18n } = useLingui();
  const [isGuestRecording, setIsGuestRecording] = useState(false);
  const [hasGuestRecorded, setHasGuestRecorded] = useState(alreadySaved);
  const [readyToContinue, setReadyToContinue] = useState(alreadySaved);
  const reactionText = i18n._("Thanks — I'll use that to make your plan. Let's keep going.");
  const recorded = alreadySaved || hasGuestRecorded;
  const ready = alreadySaved || readyToContinue;

  return (
    <InfoStep
      title={title}
      subTitle={recorded ? undefined : subTitle}
      hideActions={!ready}
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
          {!recorded ? (
            <QuizRecordAboutPrompt text={promptText} pausePlayback={isGuestRecording} autoPlay />
          ) : null}
          <QuizGuestRecordAbout
            languageCode={languageCode}
            alreadySaved={alreadySaved}
            onSaveRecording={onSaveRecording}
            onRecordingChange={setIsGuestRecording}
            onHasRecorded={setHasGuestRecorded}
            onReadyToContinue={setReadyToContinue}
          />
          {ready ? <QuizRecordAboutPrompt text={reactionText} autoPlay variant="reaction" /> : null}
        </Stack>
      }
    />
  );
};
