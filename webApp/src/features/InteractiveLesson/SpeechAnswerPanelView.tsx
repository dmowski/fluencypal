'use client';

import { ReactNode } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import StopIcon from '@mui/icons-material/Stop';
import MicIcon from '@mui/icons-material/Mic';
import { ThinkingProgress } from './ThinkingProgress';
import { UserAudioPlayer } from './UserAudioPlayer';
import { isLessonPartWithAnswer, LessonPartState } from './types';

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
  onToggleRecord: () => void;
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
  onToggleRecord,
}: SpeechAnswerPanelViewProps) => {
  const { i18n } = useLingui();
  const answered = isLessonPartWithAnswer(part);

  return (
    <Stack sx={{ gap: '12px', width: '100%' }} data-testid={`interactive-lesson-speech-${partIndex}`}>
      {answered && (
        <Stack
          sx={{
            gap: '8px',
            padding: '12px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
          }}
        >
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {i18n._('Your answer')}
          </Typography>
          <Typography variant="body2">{part.userVoiceTranscript}</Typography>
          {(audioUrl || part.userAudioUrl) && (
            <UserAudioPlayer audioUrl={audioUrl || part.userAudioUrl} />
          )}
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {i18n._('Feedback')}
          </Typography>
          <Typography variant="body2">{part.aiResultToUser}</Typography>
        </Stack>
      )}

      {isEvaluating && <ThinkingProgress />}

      {!isEvaluating && (
        <Stack sx={{ gap: '10px', width: '100%' }}>
          {(isRecording || visualizer) && (
            <Stack
              sx={{
                width: '100%',
                minHeight: '40px',
                justifyContent: 'center',
              }}
              data-testid="interactive-lesson-recording-visualizer"
            >
              {visualizer}
            </Stack>
          )}

          {isRecording && (
            <Typography variant="caption" sx={{ color: '#ff8e86' }}>
              {i18n._('Recording...')}
            </Typography>
          )}

          {error && (
            <Typography variant="caption" color="error">
              {error}
            </Typography>
          )}

          {transcription && !isRecording && !isTranscribing && (
            <Stack sx={{ gap: '8px' }}>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {i18n._('Your answer')}
              </Typography>
              <Typography variant="body2">{transcription}</Typography>
              {previewBlob && <UserAudioPlayer audioBlob={previewBlob} />}
            </Stack>
          )}

          {isTranscribing && (
            <Typography variant="body2" className="loading-shimmer">
              {i18n._('Processing...')}
            </Typography>
          )}

          <Stack sx={{ flexDirection: 'row', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              disabled={isTranscribing}
              variant="contained"
              color={isRecording ? 'error' : 'info'}
              size="large"
              startIcon={isRecording ? <StopIcon /> : <MicIcon />}
              onClick={onToggleRecord}
            >
              {isRecording
                ? i18n._('Stop')
                : answered
                  ? i18n._('Answer again')
                  : i18n._('Record answer')}
            </Button>
          </Stack>

          {needMoreText && (
            <Typography variant="caption" sx={{ color: '#ff8e86' }}>
              {i18n._('Please record a longer answer — a few words is enough.')}
            </Typography>
          )}
        </Stack>
      )}
    </Stack>
  );
};
