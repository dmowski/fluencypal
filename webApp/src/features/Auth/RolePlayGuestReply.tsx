'use client';

import { useEffect, useState } from 'react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Mic, Square } from 'lucide-react';
import { useAudioRecorder } from '@/features/Audio/useAudioRecorder';
import { sendSpeechStart } from '@/features/Analytics/Custom/sendSpeechStart';
import {
  hasGuestReply,
  peekGuestReplyRecording,
  saveGuestReplyRecording,
} from './rolePlayGuestReplyStorage';

const blobFormat = (blob: Blob): string => blob.type || 'audio/webm';

const SKELETON_LINES = [
  [76, 44, 58, 32],
  [62, 50, 40],
  [48, 36],
] as const;

const skeletonLineCount = (durationSec: number): number => {
  return durationSec >= 6 ? 3 : 2;
};

const GuestReplySkeleton = ({ durationSec }: { durationSec: number }) => {
  const { i18n } = useLingui();
  const lineCount = skeletonLineCount(durationSec);

  return (
    <Stack
      data-testid="roleplay-guest-reply-skeleton"
      aria-label={i18n._('You:')}
      sx={{
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
        maxWidth: '88%',
        gap: '4px',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          opacity: 0.5,
          paddingRight: '4px',
        }}
      >
        {i18n._('You:')}
      </Typography>
      <Stack
        aria-hidden
        sx={{
          gap: '10px',
          padding: '14px 16px',
          borderRadius: '16px 16px 4px 16px',
          backgroundColor: 'rgba(147, 197, 253, 0.16)',
        }}
      >
        {SKELETON_LINES.slice(0, lineCount).map((line, lineIndex) => (
          <Stack
            key={lineIndex}
            direction="row"
            sx={{
              gap: '8px',
            }}
          >
            {line.map((width, wordIndex) => (
              <Box
                key={wordIndex}
                sx={{
                  height: '12px',
                  width: `${width}px`,
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  filter: 'blur(3px)',
                }}
              />
            ))}
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

export const RolePlayGuestReply = ({
  rolePlayId,
  onRecordingChange,
  onHasReplied,
}: {
  rolePlayId: string;
  onRecordingChange?: (isRecording: boolean) => void;
  onHasReplied?: (hasReplied: boolean) => void;
}) => {
  const { i18n } = useLingui();
  const recorder = useAudioRecorder();
  const [hasReplied, setHasReplied] = useState(() => hasGuestReply(rolePlayId));

  useEffect(() => {
    onRecordingChange?.(recorder.isRecording);
  }, [onRecordingChange, recorder.isRecording]);

  useEffect(() => {
    onHasReplied?.(hasReplied);
  }, [hasReplied, onHasReplied]);

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

  const recording = peekGuestReplyRecording();
  const replyDurationSec =
    recording?.rolePlayId === rolePlayId ? recording.durationSec : 3;

  return (
    <Stack
      data-testid="roleplay-guest-reply"
      sx={{
        alignItems: hasReplied ? 'stretch' : 'center',
        width: '100%',
        gap: hasReplied ? '16px' : '8px',
        paddingTop: '4px',
      }}
    >
      {hasReplied ? (
        <>
          <GuestReplySkeleton durationSec={replyDurationSec} />
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              paddingTop: '4px',
            }}
          >
            {i18n._('Sign in to keep talking')}
          </Typography>
        </>
      ) : (
        <>
          <Typography
            variant="caption"
            sx={{
              opacity: 0.7,
              letterSpacing: '0.02em',
            }}
          >
            {recorder.isRecording ? i18n._('Recording…') : i18n._('Your turn')}
          </Typography>
          <Stack
            data-testid="roleplay-guest-reply-visualizer"
            sx={{
              alignSelf: 'stretch',
              justifyContent: 'center',
              width: '100%',
              height: recorder.isRecording ? '56px' : 0,
              overflow: 'hidden',
              '& canvas': {
                width: '100% !important',
              },
            }}
          >
            {recorder.visualizerComponent}
          </Stack>
          <IconButton
            onClick={() => void onToggleRecording()}
            aria-label={recorder.isRecording ? i18n._('Stop') : i18n._('Reply')}
            data-analytics="reply-first-line"
            data-testid="roleplay-guest-reply-button"
            sx={{
              width: 72,
              height: 72,
              backgroundColor: recorder.isRecording ? 'error.main' : 'primary.main',
              color: '#0b1220',
              '&:hover': {
                backgroundColor: recorder.isRecording ? 'error.dark' : 'primary.dark',
              },
            }}
          >
            {recorder.isRecording ? <Square size={26} /> : <Mic size={26} />}
          </IconButton>
        </>
      )}

      {recorder.error ? (
        <Typography color="error" variant="body2">
          {recorder.error}
        </Typography>
      ) : null}
    </Stack>
  );
};
