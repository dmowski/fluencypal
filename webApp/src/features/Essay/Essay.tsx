'use client';
import { useEffect, useRef, useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useVadAudioRecorder } from '@/features/Audio/useVadAudioRecorder';
import { useLingui } from '@lingui/react';
import { useEssay } from './useEssay';
import { EssayText } from './EssayText';

export const Essay = () => {
  const { i18n } = useLingui();
  const { essays, lastEssay, createEssay, updateEssay, appendToEssay, deleteEssay } = useEssay();

  const [activeEssayId, setActiveEssayId] = useState<string | null>(null);

  const onTranscriptionStart = () => {};

  const recorder = useVadAudioRecorder({
    onTranscriptionStart,
    silenceMs: 3500,
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
  };

  const handleContinueLastEssay = () => {
    if (lastEssay) {
      setActiveEssayId(lastEssay.id);
    }
    recorder.start();
  };

  const handleRecordNewEssay = () => {
    const newEssay = createEssay();
    setActiveEssayId(newEssay.id);
    recorder.start();
  };

  const handleContinueRecording = (essayId: string) => {
    setActiveEssayId(essayId);
    recorder.start();
  };

  return (
    <Stack
      sx={{
        width: '100%',
        maxWidth: '800px',
        gap: '20px',
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        {recorder.isRecording && (
          <Button variant="contained" color="error" onClick={handleStopRecording}>
            {i18n._('Stop Recording')}
          </Button>
        )}

        {!recorder.isRecording && essays.length === 0 && (
          <Button variant="contained" color="primary" onClick={handleStartRecording}>
            {i18n._('Start Recording')}
          </Button>
        )}

        {!recorder.isRecording && essays.length > 0 && (
          <>
            <Button variant="outlined" onClick={handleContinueLastEssay}>
              {i18n._('Continue recording last essay')}
            </Button>
            <Button variant="outlined" onClick={handleRecordNewEssay}>
              {i18n._('Record new essay')}
            </Button>
          </>
        )}
      </Stack>

      <Stack
        sx={{
          minHeight: '40px',
        }}
      >
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

      {essays.length === 0 && (
        <Typography variant="body1" color="text.secondary">
          {i18n._('No essays yet. Start recording to create your first essay.')}
        </Typography>
      )}

      {essays.length > 0 && (
        <Stack spacing={2}>
          {[...essays].reverse().map((essay) => (
            <Stack key={essay.id}>
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
