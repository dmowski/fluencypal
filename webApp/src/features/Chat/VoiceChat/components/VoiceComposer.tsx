'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Mic } from 'lucide-react';
import { useVoiceTake } from '../useVoiceTake';

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
  const { recorder, transcript, corrected, suggestion, durationSec } = useVoiceTake();

  return (
    <Stack data-testid="voice-chat-recorder" sx={{ width: '100%', gap: '10px' }}>
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
        <Stack sx={{ gap: '8px' }}>
          <Typography sx={{ fontWeight: 700 }}>{i18n._('What we heard')}</Typography>
          <Typography>{transcript}</Typography>
          {corrected && corrected.trim() !== transcript.trim() ? (
            <>
              <Typography sx={{ fontWeight: 700 }}>{i18n._('A clearer version')}</Typography>
              <Typography>{corrected}</Typography>
            </>
          ) : null}
          {suggestion ? <Typography sx={{ opacity: 0.8 }}>{suggestion}</Typography> : null}
          <Stack direction="row" sx={{ gap: '8px', flexWrap: 'wrap' }}>
            <Button
              data-testid="voice-chat-send"
              variant="contained"
              color="info"
              disabled={isSending || !recorder.transcriptionBlob}
              onClick={() => {
                if (!recorder.transcriptionBlob) return;
                void onSend({
                  blob: recorder.transcriptionBlob,
                  durationSec,
                  transcript,
                  correctedTranscript: corrected || transcript,
                }).then(() => recorder.removeTranscript());
              }}
              sx={{ textTransform: 'none' }}
            >
              {isSending ? i18n._('Sending...') : i18n._('Send voice message')}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                recorder.removeTranscript();
                void recorder.startRecording();
              }}
              sx={{ textTransform: 'none' }}
            >
              {i18n._('Record again')}
            </Button>
          </Stack>
        </Stack>
      )}
      {recorder.error ? <Typography color="error">{recorder.error}</Typography> : null}
    </Stack>
  );
};
