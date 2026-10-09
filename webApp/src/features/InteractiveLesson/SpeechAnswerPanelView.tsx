'use client';

import { ReactNode, useState } from 'react';
import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { VoiceRecordControl } from '@/features/Audio/VoiceRecordControl';
import { LessonMarkdown } from './LessonMarkdown';
import { ThinkingProgress } from './ThinkingProgress';
import { UserAudioPlayer } from './UserAudioPlayer';
import { isLessonPartWithAnswer, LessonPartState } from './types';
import { PlayButton } from './PlayButton';
import { lessonSx } from './lessonTheme';

export interface SpeechAnswerPanelViewProps {
  part: LessonPartState;
  partIndex: number;
  audioUrl?: string;
  previewBlob?: Blob | null;
  isEvaluating: boolean;
  isRecording: boolean;
  isTranscribing: boolean;
  transcription: string | null;
  error: string;
  visualizer: ReactNode;
  needMoreText: boolean;
  isOpenTalk?: boolean;
  isReadAloud?: boolean;
  autoPlayFeedback?: boolean;
  onToggleRecord: () => void;
  onCancelRecord: () => void;
}

export const SpeechAnswerPanelView = ({
  part,
  partIndex,
  audioUrl,
  previewBlob,
  isEvaluating,
  isRecording,
  isTranscribing,
  transcription,
  error,
  visualizer,
  needMoreText,
  isOpenTalk,
  isReadAloud,
  autoPlayFeedback = false,
  onToggleRecord,
  onCancelRecord,
}: SpeechAnswerPanelViewProps) => {
  const { i18n } = useLingui();
  const answered = isLessonPartWithAnswer(part);
  const [isFeedbackPlaying, setIsFeedbackPlaying] = useState(false);

  return (
    <Stack
      sx={{ gap: '12px', width: '100%' }}
      data-testid={`interactive-lesson-speech-${partIndex}`}
    >
      <Stack sx={{ gap: '10px', width: '100%' }}>
        {error && (
          <Typography variant="caption" color="error">
            {error}
          </Typography>
        )}

        {isReadAloud && !answered && (
          <Typography variant="body2" sx={lessonSx.textSecondary}>
            {i18n._('Read the text aloud. You can play it first.')}
          </Typography>
        )}
        {isOpenTalk && !answered && (
          <Typography variant="body2" sx={lessonSx.textSecondary}>
            {i18n._('Speak for about 2–3 minutes. This talk helps us pick your next lesson.')}
          </Typography>
        )}

        <VoiceRecordControl
          isRecording={isRecording}
          isTranscribing={isTranscribing}
          isEvaluating={isEvaluating}
          visualizer={visualizer}
          idleLabel={
            answered
              ? isReadAloud
                ? i18n._('Read again')
                : i18n._('Answer again')
              : isReadAloud
                ? i18n._('Read aloud')
                : i18n._('Record answer')
          }
          idleAppearance={answered ? 'ghost' : 'outlined'}
          onToggle={onToggleRecord}
          onCancel={onCancelRecord}
          evaluatingContent={<ThinkingProgress variant="inline" />}
          visualizerTestId="interactive-lesson-recording-visualizer"
          cancelTestId="interactive-lesson-cancel-recording"
          sx={{ paddingTop: '10px' }}
        />

        {needMoreText && (
          <Typography variant="caption" sx={lessonSx.warningText}>
            {isOpenTalk
              ? i18n._('Please talk a bit longer — aim for about two minutes.')
              : isReadAloud
                ? i18n._('Please read more of the text.')
                : i18n._('Please record a longer answer — a few words is enough.')}
          </Typography>
        )}
      </Stack>

      {answered && (
        <Stack
          sx={{
            position: 'relative',
          }}
        >
          <Stack
            sx={{
              ...lessonSx.answerCard,
              padding: '6px 12px 8px',
              borderRadius: '10px 10px 0 0',
            }}
          >
            <Stack
              sx={{
                flexDirection: 'row',
                width: '100%',
                gap: '2px',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Stack>
                <Typography variant="caption" sx={lessonSx.cardCaption}>
                  {isReadAloud ? i18n._('Your reading') : i18n._('Your answer')}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  {part.userVoiceTranscript}
                </Typography>
              </Stack>

              {(audioUrl || part.userAudioUrl) && (
                <UserAudioPlayer audioUrl={audioUrl || part.userAudioUrl} surface="light" />
              )}
            </Stack>
          </Stack>

          <Stack
            sx={{
              ...lessonSx.feedbackCard,
              padding: '13px 12px',
              borderRadius: '0 0 10px 10px',
            }}
          >
            <Stack
              sx={{
                flexDirection: 'row',
                width: '100%',
                gap: '10px',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Stack>
                <Typography variant="caption" sx={lessonSx.cardCaption}>
                  {isFeedbackPlaying ? i18n._('Playing') : i18n._('Feedback')}
                </Typography>
                <LessonMarkdown content={part.aiResultToUser} size="feedback" />
              </Stack>
              <PlayButton
                text={part.aiResultToUser}
                autoPlay={autoPlayFeedback}
                testId="interactive-lesson-feedback-play"
                onChangeState={setIsFeedbackPlaying}
                surface="light"
              />
            </Stack>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};
