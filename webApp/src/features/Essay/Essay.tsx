'use client';
import { useEffect, useRef, useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useVadAudioRecorder } from '@/features/Audio/useVadAudioRecorder';
import { useLingui } from '@lingui/react';
import { useEssay, EssayProvider } from './useEssay';
import { EssayText } from './EssayText';
import { Essay as EssayType } from './types';

export const Essay = () => {
  const { i18n } = useLingui();
  const { essays, lastEssay, createEssay, updateEssay, appendToEssay, deleteEssay } = useEssay();

  const [activeEssayId, setActiveEssayId] = useState<string | null>(null);
  const [showContinueChoice, setShowContinueChoice] = useState(false);

  const activeEssay: EssayType | null = essays.find((e) => e.id === activeEssayId) ?? null;

  const onTranscriptionStart = () => {};

  const recorder = useVadAudioRecorder({
    onTranscriptionStart,
    silenceMs: 1500,
  });

  const prevTranscript = useRef<string | null>(null);

  useEffect(() => {
    if (
      recorder.lastTranscript &&
      recorder.lastTranscript !== prevTranscript.current &&
      activeEssayId
    ) {
      prevTranscript.current = recorder.lastTranscript;
      appendToEssay(activeEssayId, recorder.lastTranscript);
    }
  }, [recorder.lastTranscript, activeEssayId, appendToEssay]);

  const handleStartRecording = () => {
    setShowContinueChoice(false);

    if (essays.length === 0) {
      const newEssay = createEssay();
      setActiveEssayId(newEssay.id);
    } else {
      setActiveEssayId(lastEssay!.id);
    }

    recorder.start();
  };

  const handleStopRecording = () => {
    recorder.stop();

    if (essays.length > 1) {
      setShowContinueChoice(true);
    }
  };

  const handleContinueLastEssay = () => {
    setShowContinueChoice(false);
    if (lastEssay) {
      setActiveEssayId(lastEssay.id);
    }
    recorder.start();
  };

  const handleRecordNewEssay = () => {
    setShowContinueChoice(false);
    const newEssay = createEssay();
    setActiveEssayId(newEssay.id);
    recorder.start();
  };

  const handleContinueRecording = (essayId: string) => {
    setActiveEssayId(essayId);
    recorder.start();
  };

  return (
    <Stack spacing={2} sx={{ maxWidth: 700, mx: 'auto', p: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        {recorder.isRecording ? (
          <Button variant="contained" color="error" onClick={handleStopRecording}>
            {i18n._('Stop Recording')}
          </Button>
        ) : (
          <Button variant="contained" color="primary" onClick={handleStartRecording}>
            {i18n._('Start Recording')}
          </Button>
        )}

        {recorder.isTranscribing && (
          <Typography variant="body2" color="text.secondary">
            {i18n._('Transcribing...')}
          </Typography>
        )}

        {recorder.error && (
          <Typography variant="body2" color="error">
            {recorder.error}
          </Typography>
        )}
      </Stack>

      {recorder.isRecording && activeEssay && (
        <Stack
          sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'primary.main',
            borderRadius: 1,
            bgcolor: 'action.hover',
          }}
        >
          <Typography variant="caption" color="text.secondary" gutterBottom>
            {i18n._('Recording into: current essay')}
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {activeEssay.text}
            {recorder.isSpeaking ? ' ...' : ''}
          </Typography>
        </Stack>
      )}

      {showContinueChoice && (
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={handleContinueLastEssay}>
            {i18n._('Continue recording last essay')}
          </Button>
          <Button variant="outlined" onClick={handleRecordNewEssay}>
            {i18n._('Record new essay')}
          </Button>
        </Stack>
      )}

      {essays.length > 0 && (
        <Stack spacing={2}>
          <Divider />
          {[...essays].reverse().map((essay) => (
            <Stack
              key={essay.id}
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <EssayText
                text={essay.text}
                isRecording={recorder.isRecording}
                onDelete={() => deleteEssay(essay.id)}
                onContinueRecording={() => handleContinueRecording(essay.id)}
                onUpdate={(newText) => updateEssay(essay.id, newText)}
              />
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  );
};
