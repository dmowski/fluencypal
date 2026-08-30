'use client';

import { ReactNode, useState } from 'react';
import { Button, IconButton, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import StopIcon from '@mui/icons-material/Stop';
import MicIcon from '@mui/icons-material/Mic';
import { X } from 'lucide-react';
import { LessonMarkdown } from './LessonMarkdown';
import { ThinkingProgress } from './ThinkingProgress';
import { UserAudioPlayer } from './UserAudioPlayer';
import { isLessonPartWithAnswer, LessonPartState } from './types';
import { AudioPlayIcon } from '../Audio/AudioPlayIcon';

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

        {isOpenTalk && !answered && (
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {i18n._('Speak for about 2–3 minutes. This talk helps us pick your next lesson.')}
          </Typography>
        )}

        <Stack
          sx={{
            flexDirection: 'row',
            gap: 0,
            alignItems: 'stretch',
            width: '100%',
            paddingTop: '10px',
          }}
        >
          <Button
            disabled={isTranscribing || isEvaluating}
            variant={answered && !isRecording ? 'text' : isRecording ? 'contained' : 'outlined'}
            color={isRecording ? 'error' : 'info'}
            size="large"
            startIcon={isRecording ? <StopIcon /> : <MicIcon />}
            onClick={onToggleRecord}
            sx={{
              flexShrink: 0,
              ...(isRecording && visualizer
                ? { borderTopRightRadius: 0, borderBottomRightRadius: 0 }
                : {}),
            }}
          >
            {isRecording
              ? i18n._('Stop')
              : answered
                ? i18n._('Answer again')
                : i18n._('Record answer')}
          </Button>

          {isTranscribing && (
            <Stack
              sx={{
                flex: 1,
                minWidth: 0,
                justifyContent: 'center',
                padding: '0 12px',
              }}
            >
              <Typography variant="body2" className="loading-shimmer">
                {i18n._('Processing...')}
              </Typography>
            </Stack>
          )}
          {isEvaluating && (
            <Stack
              sx={{
                flex: 1,
                minWidth: 0,
                justifyContent: 'center',
                padding: '0 12px',
              }}
            >
              <ThinkingProgress variant="inline" />
            </Stack>
          )}
          {(isRecording || visualizer) && !isEvaluating && (
            <Stack
              sx={{
                flex: 1,
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: 'inset 0 0 0 1px #F44336',
                borderRadius: '0 10px 10px 0',
              }}
              data-testid="interactive-lesson-recording-visualizer"
            >
              {visualizer}
            </Stack>
          )}
          {isRecording && (
            <IconButton
              color="error"
              onClick={onCancelRecord}
              aria-label={i18n._('Cancel recording')}
              data-testid="interactive-lesson-cancel-recording"
              sx={{
                flexShrink: 0,
                alignSelf: 'stretch',
                width: '42px',
                marginLeft: '5px',
              }}
            >
              <X size={20} />
            </IconButton>
          )}
        </Stack>

        {needMoreText && (
          <Typography variant="caption" sx={{ color: '#ff8e86' }}>
            {isOpenTalk
              ? i18n._('Please talk a bit longer — aim for about two minutes.')
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
              padding: '10px 12px 15px 12px',
              borderRadius: '10px 10px 0 0',
              backgroundColor: 'rgb(240, 248, 253)',
              borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
              color: 'rgba(0, 0, 0, 0.87)',
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
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {i18n._('Your answer')}
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
                <Stack
                  sx={{
                    backgroundColor: '#111827',
                    borderRadius: '40px',
                    padding: '0px',
                  }}
                >
                  <UserAudioPlayer audioUrl={audioUrl || part.userAudioUrl} />
                </Stack>
              )}
            </Stack>
          </Stack>

          <Stack
            sx={{
              backgroundColor: 'rgba(240, 245, 241)',
              padding: '13px 12px',
              borderRadius: '0 0 10px 10px',
              color: 'rgba(0, 0, 0, 0.87)',
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
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {isFeedbackPlaying ? i18n._('Playing') : i18n._('Feedback')}
                </Typography>
                <LessonMarkdown content={part.aiResultToUser} />
              </Stack>
              <Stack
                data-testid="interactive-lesson-feedback-play"
                sx={{
                  backgroundColor: isFeedbackPlaying ? '#1d4ed8' : '#111827',
                  borderRadius: '40px',
                  padding: '0px',
                  '@keyframes lessonFeedbackPulse': {
                    '0%': { boxShadow: '0 0 0 0 rgba(37, 99, 235, 0.7)' },
                    '70%': { boxShadow: '0 0 0 10px rgba(37, 99, 235, 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(37, 99, 235, 0)' },
                  },
                  animation: isFeedbackPlaying ? 'lessonFeedbackPulse 1.4s ease-out infinite' : 'none',
                }}
              >
                <AudioPlayIcon
                  text={part.aiResultToUser}
                  cache
                  color="#fff"
                  opacity={1}
                  autoPlay={autoPlayFeedback}
                  onChangeState={setIsFeedbackPlaying}
                />
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};
