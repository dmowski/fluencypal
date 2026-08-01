'use client';

import { useLingui } from '@lingui/react';
import { Button, IconButton, Stack, Typography } from '@mui/material';
import { Mic, Square } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useVoiceChatRecorder } from '../useVoiceChatRecorder';
import { voiceChatUi } from '../voiceChatUi';
import { VoiceChatPlayer } from './VoiceChatPlayer';

interface VoiceChatRecorderPanelProps {
  title: string;
  submitLabel: string;
  minSeconds?: number;
  onSubmit: (blob: Blob, durationSec: number) => Promise<void>;
  onCancel?: () => void;
}

export const VoiceChatRecorderPanel = ({
  title,
  submitLabel,
  minSeconds = 1,
  onSubmit,
  onCancel,
}: VoiceChatRecorderPanelProps) => {
  const { i18n } = useLingui();
  const recorder = useVoiceChatRecorder();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const previewUrl = useMemo(() => {
    if (!recorder.recordedBlob) return null;
    return URL.createObjectURL(recorder.recordedBlob);
  }, [recorder.recordedBlob]);

  const handleSubmit = async () => {
    if (!recorder.recordedBlob) return;
    if (recorder.recordingSeconds < minSeconds) {
      alert(
        i18n._('Please record at least {minSeconds} seconds.', {
          minSeconds,
        }),
      );
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(recorder.recordedBlob, recorder.recordingSeconds);
      recorder.clearRecording();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack
      gap={1.25}
      data-testid="voice-chat-recorder"
      sx={{
        p: 1.5,
        borderRadius: 1.5,
        border: `1px solid ${voiceChatUi.borderSubtle}`,
        bgcolor: voiceChatUi.surfaceSubtle,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 500, letterSpacing: '-0.01em' }}>
        {title}
      </Typography>

      {recorder.visualizer}

      {recorder.error && (
        <Typography color="error" variant="caption">
          {recorder.error}
        </Typography>
      )}

      {!recorder.isRecording && !recorder.recordedBlob && (
        <Stack alignItems="center" gap={1} sx={{ py: 0.5 }}>
          <IconButton
            onClick={() => void recorder.startRecording()}
            aria-label={i18n._('Start recording')}
            sx={{
              width: 52,
              height: 52,
              bgcolor: voiceChatUi.accent,
              color: '#111',
              '&:hover': { bgcolor: '#79b8ff' },
            }}
          >
            <Mic size={22} />
          </IconButton>
          <Typography variant="caption" sx={{ color: voiceChatUi.textMuted }}>
            {i18n._('Start recording')}
          </Typography>
        </Stack>
      )}

      {recorder.isRecording && (
        <Stack direction="row" gap={1.25} alignItems="center" flexWrap="wrap">
          <Stack direction="row" alignItems="center" gap={0.75}>
            <Stack
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#f85149',
                animation: 'pulse 1.4s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.35 },
                },
              }}
            />
            <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {i18n._('Recording… {seconds}s', { seconds: recorder.recordingSeconds })}
            </Typography>
          </Stack>
          <Stack direction="row" gap={0.75} sx={{ ml: 'auto' }}>
            <Button
              size="small"
              variant="contained"
              color="warning"
              startIcon={<Square size={14} fill="currentColor" />}
              onClick={recorder.stopRecording}
            >
              {i18n._('Stop')}
            </Button>
            <Button size="small" variant="text" onClick={recorder.cancelRecording}>
              {i18n._('Cancel')}
            </Button>
          </Stack>
        </Stack>
      )}

      {recorder.recordedBlob && !recorder.isRecording && (
        <Stack gap={1.25}>
          <VoiceChatPlayer audioUrl={previewUrl} label={i18n._('Preview your recording')} />
          <Stack direction="row" gap={0.75}>
            <Button variant="contained" disabled={isSubmitting} onClick={() => void handleSubmit()}>
              {isSubmitting ? i18n._('Sending…') : submitLabel}
            </Button>
            <Button
              variant="text"
              disabled={isSubmitting}
              onClick={() => {
                recorder.clearRecording();
                onCancel?.();
              }}
            >
              {i18n._('Discard')}
            </Button>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};
