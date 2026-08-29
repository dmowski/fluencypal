'use client';

import { ReactNode } from 'react';
import { Button, IconButton, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import SendIcon from '@mui/icons-material/Send';
import StopIcon from '@mui/icons-material/Stop';
import MicIcon from '@mui/icons-material/Mic';
import { Mic, Trash } from 'lucide-react';
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
  onSubmit: () => void;
  onClear: () => void;
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
  onSubmit,
  onClear,
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
          {(audioUrl || (answered && part.userAudioUrl)) && (
            <UserAudioPlayer audioUrl={audioUrl || part.userAudioUrl} />
          )}
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {i18n._('Feedback')}
          </Typography>
          <Typography variant="body2">{part.aiResultToUser}</Typography>
        </Stack>
      )}

      {isEvaluating && <ThinkingProgress />}

      {!answered && !isEvaluating && (
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
            {(!transcription || isTranscribing || isRecording) && (
              <Button
                disabled={isTranscribing}
                variant="contained"
                color={isRecording ? 'error' : 'info'}
                size="large"
                startIcon={isRecording ? <StopIcon /> : <MicIcon />}
                onClick={onToggleRecord}
              >
                {isRecording ? i18n._('Stop') : i18n._('Record answer')}
              </Button>
            )}

            {transcription && !isRecording && !isTranscribing && (
              <>
                <Button
                  variant="contained"
                  color="info"
                  size="large"
                  disabled={needMoreText}
                  endIcon={<SendIcon />}
                  onClick={onSubmit}
                >
                  {i18n._('Submit')}
                </Button>
                <Button
                  variant="outlined"
                  color="info"
                  size="large"
                  endIcon={<Mic />}
                  onClick={onToggleRecord}
                >
                  {i18n._('Re-record')}
                </Button>
                <IconButton size="small" onClick={onClear}>
                  <Trash size={18} color="rgba(200, 200, 200, 1)" />
                </IconButton>
              </>
            )}
          </Stack>

          {needMoreText && (
            <Typography variant="caption" sx={{ color: '#ff8e86' }}>
              {i18n._('Please record a longer message (at least a few words).')}
            </Typography>
          )}
        </Stack>
      )}
    </Stack>
  );
};
