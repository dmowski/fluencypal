'use client';
import { useState, useEffect, useRef } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useRealtimeTranscript } from '@/features/Transcript/useRealtimeTranscript';
import { useLingui } from '@lingui/react';
import { useEssay } from './useEssay';
import { EssayText } from './EssayText';
import { CirclePlus, Loader, Mic, Pause } from 'lucide-react';
import { Add, AddCircle } from '@mui/icons-material';

export const Essay = () => {
  const { i18n } = useLingui();
  const {
    essays,
    lastEssay,
    createEssay,
    updateEssay,
    appendToEssay,
    deleteEssay,
    analyzeEssay,
    analyzingEssayId,
  } = useEssay();

  const [activeEssayId, setActiveEssayId] = useState<string | null>(null);

  const recorder = useRealtimeTranscript();
  const isRecording = recorder.isActive || recorder.isActivating;

  const startForEssay = (essayId: string) => {
    setActiveEssayId(essayId);
    recorder.start({ mode: 'ai' });
  };

  const handleStartRecording = () => {
    if (essays.length === 0) {
      const newEssay = createEssay();
      startForEssay(newEssay.id);
    } else {
      startForEssay(lastEssay!.id);
    }
  };

  const handleStopRecording = () => {
    if (activeEssayId && recorder.transcript) {
      appendToEssay(activeEssayId, recorder.transcript);
    }
    recorder.stop();
    setActiveEssayId(null);
  };

  const handleContinueLastEssay = () => {
    if (lastEssay) {
      startForEssay(lastEssay.id);
    }
  };

  const handleRecordNewEssay = () => {
    const newEssay = createEssay();
    startForEssay(newEssay.id);
  };

  const handleContinueRecording = (essayId: string) => {
    startForEssay(essayId);
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
        {isRecording && (
          <Button
            variant="contained"
            disabled={recorder.isActivating}
            color="error"
            startIcon={recorder.isActivating ? <Loader size={16} /> : <Pause size={16} />}
            onClick={handleStopRecording}
          >
            {i18n._('Stop Recording')}
          </Button>
        )}

        {!isRecording && essays.length === 0 && (
          <Button
            startIcon={<Mic size={'18px'} />}
            variant="contained"
            color="info"
            onClick={handleStartRecording}
          >
            {i18n._('Start Recording')}
          </Button>
        )}

        {!isRecording && essays.length > 0 && (
          <>
            <Button
              startIcon={<Mic size={'18px'} />}
              variant="contained"
              color="info"
              onClick={handleContinueLastEssay}
            >
              {i18n._('Continue recording last essay')}
            </Button>
            <Button
              variant="outlined"
              color="info"
              onClick={handleRecordNewEssay}
              startIcon={<CirclePlus size={'18px'} />}
            >
              {i18n._('Record new essay')}
            </Button>
          </>
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
                essay={essay}
                activeTranscript={activeEssayId === essay.id ? recorder.transcript : undefined}
                isRecording={isRecording}
                analysis={essay.analysis ?? undefined}
                isAnalyzing={analyzingEssayId === essay.id}
                onDelete={() => deleteEssay(essay.id)}
                onContinueRecording={() => handleContinueRecording(essay.id)}
                onUpdate={(newText) => updateEssay(essay.id, newText)}
                onAnalyze={() => analyzeEssay(essay.id)}
              />
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  );
};
