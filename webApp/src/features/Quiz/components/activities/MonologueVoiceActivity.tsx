'use client';

import { Stack, Typography } from '@mui/material';
import { useAudioRecorder } from '@/features/Audio/useAudioRecorder';
import { RecordUserAudioAnswer } from '@/features/Survey/RecordUserAudioAnswer';
import { MonologueVoiceQuestion } from '../../types';
import { useEffect } from 'react';

export const MonologueVoiceActivity = ({
  question,
  transcription,
  onTranscriptionChange,
  disabled,
}: {
  question: MonologueVoiceQuestion;
  transcription: string;
  onTranscriptionChange: (value: string) => void;
  disabled?: boolean;
}) => {
  const recorder = useAudioRecorder();
  const minWords = question.minWords ?? 40;

  useEffect(() => {
    if (!recorder.transcription) return;
    const combined = [transcription, recorder.transcription].filter(Boolean).join(' ').trim();
    onTranscriptionChange(combined);
    recorder.removeTranscript();
  }, [recorder.transcription]);

  return (
    <Stack sx={{ gap: '20px' }}>
      <Typography variant="h6" sx={{ fontWeight: 600, whiteSpace: 'pre-wrap' }}>
        {question.topicPrompt}
      </Typography>

      {!disabled && (
        <RecordUserAudioAnswer
          transcript={transcription}
          minWords={minWords}
          maxWords={question.maxWords}
          isTranscribing={recorder.isTranscribing}
          visualizerComponent={recorder.visualizerComponent}
          isRecording={recorder.isRecording}
          stopRecording={recorder.stopRecording}
          startRecording={recorder.startRecording}
          clearTranscript={() => onTranscriptionChange('')}
          error={recorder.error || null}
        />
      )}
    </Stack>
  );
};
