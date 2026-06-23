'use client';

import { Stack, Typography } from '@mui/material';
import { useAudioRecorder } from '@/features/Audio/useAudioRecorder';
import { RecordUserAudioAnswer } from '@/features/Survey/RecordUserAudioAnswer';
import { DescribePictureVoiceQuestion } from '../../types';
import { SubmittedAnswerPreview } from '../SubmittedAnswerPreview';
import { useEffect } from 'react';

export const DescribePictureVoiceActivity = ({
  question,
  transcription,
  onTranscriptionChange,
  disabled,
}: {
  question: DescribePictureVoiceQuestion;
  transcription: string;
  onTranscriptionChange: (value: string) => void;
  disabled?: boolean;
}) => {
  const recorder = useAudioRecorder();
  const minWords = question.minWords ?? 10;

  const handleTranscriptUpdate = () => {
    if (!recorder.transcription) return;
    const combined = [transcription, recorder.transcription].filter(Boolean).join(' ').trim();
    onTranscriptionChange(combined);
    recorder.removeTranscript();
  };

  useEffect(() => {
    if (recorder.transcription) {
      handleTranscriptUpdate();
    }
  }, [recorder.transcription]);

  return (
    <Stack sx={{ gap: '20px' }}>
      {question.imageUrl && (
        <img
          src={question.imageUrl}
          alt={question.promptText}
          style={{ width: '100%', borderRadius: '12px' }}
        />
      )}
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        {question.promptText}
      </Typography>

      {!disabled ? (
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
      ) : (
        <SubmittedAnswerPreview text={transcription} />
      )}
    </Stack>
  );
};
