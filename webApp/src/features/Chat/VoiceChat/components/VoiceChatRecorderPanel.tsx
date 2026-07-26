'use client';

import { useLingui } from '@lingui/react';
import { Button, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useVoiceChatRecorder } from '../useVoiceChatRecorder';
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
    <Stack gap={1.5} data-testid="voice-chat-recorder" sx={{ p: 1.5, bgcolor: 'rgba(0,0,0,0.25)', borderRadius: 2 }}>
      <Typography fontWeight={700}>{title}</Typography>
      {recorder.visualizer}
      {recorder.error && (
        <Typography color="error" variant="body2">
          {recorder.error}
        </Typography>
      )}
      {!recorder.isRecording && !recorder.recordedBlob && (
        <Button variant="contained" onClick={() => void recorder.startRecording()}>
          {i18n._('Start recording')}
        </Button>
      )}
      {recorder.isRecording && (
        <Stack direction="row" gap={1} alignItems="center">
          <Typography variant="body2">
            {i18n._('Recording… {seconds}s', { seconds: recorder.recordingSeconds })}
          </Typography>
          <Button variant="contained" color="warning" onClick={recorder.stopRecording}>
            {i18n._('Stop')}
          </Button>
          <Button variant="outlined" onClick={recorder.cancelRecording}>
            {i18n._('Cancel')}
          </Button>
        </Stack>
      )}
      {recorder.recordedBlob && !recorder.isRecording && (
        <Stack gap={1}>
          <VoiceChatPlayer audioUrl={previewUrl} label={i18n._('Preview your recording')} />
          <Stack direction="row" gap={1}>
            <Button variant="contained" disabled={isSubmitting} onClick={() => void handleSubmit()}>
              {isSubmitting ? i18n._('Sending…') : submitLabel}
            </Button>
            <Button
              variant="outlined"
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
