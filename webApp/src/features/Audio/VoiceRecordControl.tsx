'use client';

import { ReactNode } from 'react';
import { Button, IconButton, Stack, Typography } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import { useLingui } from '@lingui/react';
import StopIcon from '@mui/icons-material/Stop';
import MicIcon from '@mui/icons-material/Mic';
import { X } from 'lucide-react';
import {
  lessonGhostButtonSx,
  lessonRecordButtonSx,
  lessonRecordingButtonSx,
  lessonRecordingCancelSx,
  lessonRecordingVisualizerSx,
} from '@/features/InteractiveLesson/lessonTheme';

export const VoiceRecordControl = ({
  isRecording,
  isTranscribing,
  isEvaluating = false,
  visualizer,
  idleLabel,
  idleAppearance = 'outlined',
  disabled = false,
  onToggle,
  onCancel,
  evaluatingContent,
  buttonTestId,
  visualizerTestId,
  cancelTestId,
  sx,
}: {
  isRecording: boolean;
  isTranscribing: boolean;
  isEvaluating?: boolean;
  visualizer: ReactNode;
  idleLabel: string;
  idleAppearance?: 'outlined' | 'ghost';
  disabled?: boolean;
  onToggle: () => void;
  onCancel?: () => void;
  evaluatingContent?: ReactNode;
  buttonTestId?: string;
  visualizerTestId?: string;
  cancelTestId?: string;
  sx?: SxProps<Theme>;
}) => {
  const { i18n } = useLingui();
  const stopLabel = i18n._('Stop');
  const showVisualizer = (isRecording || Boolean(visualizer)) && !isEvaluating;

  return (
    <Stack
      sx={[
        {
          flexDirection: 'row',
          gap: 0,
          alignItems: 'stretch',
          width: '100%',
        },
        ...(sx == null ? [] : Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Button
        disabled={disabled || isTranscribing || isEvaluating}
        variant={
          idleAppearance === 'ghost' && !isRecording
            ? 'text'
            : isRecording
              ? 'contained'
              : 'outlined'
        }
        color="inherit"
        size="large"
        startIcon={isRecording ? <StopIcon /> : <MicIcon />}
        onClick={onToggle}
        data-testid={buttonTestId}
        sx={{
          flexShrink: 0,
          ...(isRecording
            ? lessonRecordingButtonSx
            : idleAppearance === 'ghost'
              ? lessonGhostButtonSx
              : lessonRecordButtonSx),
          ...(isRecording && visualizer
            ? { borderTopRightRadius: 0, borderBottomRightRadius: 0 }
            : {}),
        }}
      >
        {isRecording ? stopLabel : idleLabel}
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
      {isEvaluating && evaluatingContent ? (
        <Stack
          sx={{
            flex: 1,
            minWidth: 0,
            justifyContent: 'center',
            padding: '0 12px',
          }}
        >
          {evaluatingContent}
        </Stack>
      ) : null}
      {showVisualizer && (
        <Stack
          sx={{
            flex: 1,
            justifyContent: 'center',
            overflow: 'hidden',
            ...lessonRecordingVisualizerSx,
            borderRadius: '0 10px 10px 0',
          }}
          data-testid={visualizerTestId}
        >
          {visualizer}
        </Stack>
      )}
      {isRecording && onCancel && (
        <IconButton
          onClick={onCancel}
          aria-label={i18n._('Cancel recording')}
          data-testid={cancelTestId}
          sx={{
            ...lessonRecordingCancelSx,
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
  );
};
