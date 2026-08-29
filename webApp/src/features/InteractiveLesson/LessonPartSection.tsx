'use client';

import { Divider, Stack } from '@mui/material';
import { LessonMarkdown } from './LessonMarkdown';
import { SpeechAnswerPanel } from './SpeechAnswerPanel';
import { LessonPartState } from './types';

export const LessonPartSection = ({
  part,
  partIndex,
  isEvaluating,
  onPrepareSpeechAudio,
  onSubmitSpeech,
}: {
  part: LessonPartState;
  partIndex: number;
  isEvaluating: boolean;
  onPrepareSpeechAudio: (partIndex: number, blob: Blob) => void;
  onSubmitSpeech: (partIndex: number, transcript: string, blob: Blob | null) => Promise<void>;
}) => {
  return (
    <Stack sx={{ gap: '16px', width: '100%' }} data-testid={`interactive-lesson-part-${partIndex}`}>
      {partIndex > 0 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />}
      <LessonMarkdown content={part.contentMD} />
      {part.type === 'speech' && (
        <SpeechAnswerPanel
          part={part}
          partIndex={partIndex}
          isEvaluating={isEvaluating}
          onAudioReady={(blob) => onPrepareSpeechAudio(partIndex, blob)}
          onSubmit={(transcript, blob) => onSubmitSpeech(partIndex, transcript, blob)}
        />
      )}
    </Stack>
  );
};
