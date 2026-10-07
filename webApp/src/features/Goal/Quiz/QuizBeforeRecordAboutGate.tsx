'use client';

import { useState } from 'react';
import { Stack } from '@mui/material';
import { useLingui } from '@lingui/react';
import { InfoStep } from '../../Survey/InfoStep';
import { QuizGuestRecordAbout } from './QuizGuestRecordAbout';
import { QuizRecordAboutPrompt } from './QuizRecordAboutPrompt';
import { QuizGuestAboutRecording } from './quizGuestAboutStorage';
import { PracticeReasonExampleList, QuizSpokenMessage } from './QuizSpokenMessage';

export const QuizBeforeRecordAboutGate = ({
  languageCode,
  title,
  subTitle,
  promptText,
  alreadySaved = false,
  examples = [],
  contextMessage = '',
  savedTranscript = '',
  onSaveRecording,
  onContinue,
}: {
  languageCode: string;
  title: string;
  subTitle: string;
  promptText: string;
  alreadySaved?: boolean;
  examples?: string[];
  contextMessage?: string;
  savedTranscript?: string;
  onSaveRecording: (
    recording: QuizGuestAboutRecording,
    options?: { replace?: boolean },
  ) => Promise<void>;
  onContinue: () => void | Promise<void>;
}) => {
  const { i18n } = useLingui();
  const [isGuestRecording, setIsGuestRecording] = useState(false);
  const [hasGuestRecorded, setHasGuestRecorded] = useState(alreadySaved);
  const [readyToContinue, setReadyToContinue] = useState(alreadySaved);
  const [rerecordSession, setRerecordSession] = useState(0);
  const [isRerecording, setIsRerecording] = useState(false);
  const reactionText = i18n._("Thanks — I'll use that to make your plan. Let's keep going.");
  const recorded = !isRerecording && (alreadySaved || hasGuestRecorded);
  const ready = !isRerecording && (alreadySaved || readyToContinue);
  const recordAgain = () => {
    setIsRerecording(true);
    setHasGuestRecorded(false);
    setReadyToContinue(false);
    setRerecordSession((session) => session + 1);
  };
  const recordControl = (
    <QuizGuestRecordAbout
      languageCode={languageCode}
      alreadySaved={alreadySaved}
      savedTranscript={savedTranscript}
      session={rerecordSession}
      onSaveRecording={async (recording) => {
        await onSaveRecording(recording, { replace: rerecordSession > 0 });
        setIsRerecording(false);
      }}
      onRecordingChange={setIsGuestRecording}
      onHasRecorded={setHasGuestRecorded}
      onReadyToContinue={setReadyToContinue}
    />
  );

  return (
    <InfoStep
      title={title}
      subTitle={recorded ? undefined : subTitle}
      hideActions={!ready}
      actionButtonTitle={i18n._('Continue')}
      actionButtonAnalyticsId="quiz-guest-continue"
      secondButtonTitle={ready ? i18n._('Record again') : undefined}
      onSecondButtonClick={ready ? recordAgain : undefined}
      secondButtonAnalyticsId="quiz-guest-rerecord"
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
          {contextMessage.trim() ? (
            <QuizSpokenMessage label={i18n._('You said')} text={contextMessage.trim()} />
          ) : null}
          {!recorded && examples.length ? (
            <PracticeReasonExampleList heading={i18n._('For example')} examples={examples} />
          ) : null}
          {!recorded ? (
            <Stack
              data-testid="quiz-record-about-actions"
              sx={{
                position: 'sticky',
                bottom: 0,
                zIndex: 1,
                gap: '8px',
                marginTop: '4px',
                marginLeft: '-10px',
                marginRight: '-10px',
                paddingTop: '8px',
                paddingLeft: '10px',
                paddingRight: '10px',
                paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
                backgroundColor: 'rgba(10, 18, 30, 1)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: '100%',
                  height: '28px',
                  background: 'linear-gradient(to top, rgba(10, 18, 30, 1), rgba(10, 18, 30, 0))',
                  pointerEvents: 'none',
                },
              }}
            >
              <QuizRecordAboutPrompt text={promptText} pausePlayback={isGuestRecording} autoPlay />
              {recordControl}
            </Stack>
          ) : (
            recordControl
          )}
          {ready ? <QuizRecordAboutPrompt text={reactionText} autoPlay variant="reaction" /> : null}
        </Stack>
      }
    />
  );
};
