'use client';

import { useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Mic } from 'lucide-react';
import { useAudioRecorder } from '@/features/Audio/useAudioRecorder';
import { ProcessUserInput } from '@/features/Conversation/ProcessUserInput';

export const VoiceComposer = ({
  onSend,
  isSending,
}: {
  onSend: (params: {
    blob: Blob;
    durationSec: number;
    transcript: string;
    correctedTranscript: string;
  }) => Promise<void>;
  isSending: boolean;
}) => {
  const { i18n } = useLingui();
  const recorder = useAudioRecorder();
  const [corrected, setCorrected] = useState('');
  const transcript = recorder.transcription || '';
  const showCorrection = recorder.isTranscribing || transcript.length > 0;

  return (
    <Stack data-testid="voice-chat-recorder" sx={{ width: '100%', gap: '12px' }}>
      {showCorrection ? (
        <ProcessUserInput
          isTranscribing={recorder.isTranscribing}
          isRecording={recorder.isRecording}
          userMessage={transcript}
          previousBotMessage=""
          transcriptionBlob={recorder.transcriptionBlob}
          onAnalyzed={(result) => setCorrected(result.correctedMessage || result.sourceMessage)}
        />
      ) : null}
      {recorder.visualizerComponent}
      {!transcript ? (
        <Button
          variant="contained"
          color={recorder.isRecording ? 'error' : 'info'}
          startIcon={<Mic size={18} />}
          disabled={recorder.isTranscribing || isSending}
          onClick={() => {
            if (recorder.isRecording) recorder.stopRecording();
            else void recorder.startRecording();
          }}
          sx={{ alignSelf: 'flex-start', borderRadius: '12px', textTransform: 'none' }}
        >
          {recorder.isRecording
            ? i18n._('Stop')
            : recorder.isTranscribing
              ? i18n._('Writing down what you said...')
              : i18n._('Record a message')}
        </Button>
      ) : (
        <Stack direction="row" sx={{ gap: '8px', flexWrap: 'wrap' }}>
          <Button
            data-testid="voice-chat-send"
            variant="contained"
            color="info"
            disabled={isSending || recorder.isTranscribing || !recorder.transcriptionBlob}
            onClick={() => {
              if (!recorder.transcriptionBlob) return;
              const durationSec = Math.max(1, Math.round(recorder.recordingMilliSeconds / 1000));
              void onSend({
                blob: recorder.transcriptionBlob,
                durationSec,
                transcript,
                correctedTranscript: corrected || transcript,
              }).then(() => {
                setCorrected('');
                recorder.removeTranscript();
              });
            }}
            sx={{ textTransform: 'none' }}
          >
            {isSending ? i18n._('Sending...') : i18n._('Send voice message')}
          </Button>
          <Button
            variant="outlined"
            disabled={recorder.isTranscribing}
            onClick={() => {
              setCorrected('');
              recorder.removeTranscript();
              void recorder.startRecording();
            }}
            sx={{ textTransform: 'none' }}
          >
            {i18n._('Record again')}
          </Button>
        </Stack>
      )}
      {recorder.error ? <Typography color="error">{recorder.error}</Typography> : null}
    </Stack>
  );
};
