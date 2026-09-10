'use client';

import { useEffect, useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Check, Mic, Square } from 'lucide-react';
import { useAudioRecorder } from '@/features/Audio/useAudioRecorder';
import { sendSpeechStart } from '@/features/Analytics/Custom/sendSpeechStart';
import { hasGuestReply, saveGuestReplyRecording } from './rolePlayGuestReplyStorage';

const blobFormat = (blob: Blob): string => blob.type || 'audio/webm';

export const RolePlayGuestReply = ({
  rolePlayId,
  onRecordingChange,
}: {
  rolePlayId: string;
  onRecordingChange?: (isRecording: boolean) => void;
}) => {
  const { i18n } = useLingui();
  const recorder = useAudioRecorder();
  const [hasReplied, setHasReplied] = useState(() => hasGuestReply(rolePlayId));

  useEffect(() => {
    onRecordingChange?.(recorder.isRecording);
  }, [onRecordingChange, recorder.isRecording]);

  useEffect(() => {
    if (hasReplied || !recorder.transcriptionBlob) {
      return;
    }

    const durationSec = Math.max(1, Math.round(recorder.recordingMilliSeconds / 1000) || 1);
    saveGuestReplyRecording({
      rolePlayId,
      blob: recorder.transcriptionBlob,
      format: blobFormat(recorder.transcriptionBlob),
      durationSec,
    });
    sendSpeechStart('conversation');
    setHasReplied(true);
  }, [hasReplied, recorder.recordingMilliSeconds, recorder.transcriptionBlob, rolePlayId]);

  const onToggleRecording = async () => {
    if (recorder.isRecording) {
      await recorder.stopRecording();
      return;
    }
    await recorder.startRecording();
  };

  return (
    <Stack
      data-testid="roleplay-guest-reply"
      sx={{
        gap: '10px',
      }}
    >
      {recorder.visualizerComponent}

      {hasReplied ? (
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            gap: '8px',
            paddingTop: '4px',
          }}
        >
          <Check size={18} />
          <Typography variant="body2">
            {i18n._('Got it. Sign in to continue the scene.')}
          </Typography>
        </Stack>
      ) : (
        <Button
          onClick={() => void onToggleRecording()}
          startIcon={recorder.isRecording ? <Square size={'18px'} /> : <Mic size={'18px'} />}
          variant="contained"
          color={recorder.isRecording ? 'error' : 'primary'}
          data-analytics="reply-first-line"
          data-testid="roleplay-guest-reply-button"
          sx={{
            fontWeight: 500,
            textTransform: 'none',
            minHeight: '24px',
            fontSize: '17px',
            padding: '8px 18px',
          }}
        >
          {recorder.isRecording ? i18n._('Stop') : i18n._('Reply')}
        </Button>
      )}

      {recorder.error ? (
        <Typography color="error" variant="body2">
          {recorder.error}
        </Typography>
      ) : null}
    </Stack>
  );
};
