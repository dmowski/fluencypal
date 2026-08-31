'use client';

import { Divider, Stack } from '@mui/material';
import { AudioPlayIcon } from '@/features/Audio/AudioPlayIcon';
import { LessonMarkdown } from './LessonMarkdown';
import { SpeechAnswerPanel } from './SpeechAnswerPanel';
import { LessonPartState } from './types';

export const LessonPartSection = ({
  part,
  partIndex,
  isEvaluating,
  isOpenTalk,
  isReadAloud,
  onPrepareSpeechAudio,
  onSubmitSpeech,
}: {
  part: LessonPartState;
  partIndex: number;
  isEvaluating: boolean;
  isOpenTalk: boolean;
  isReadAloud?: boolean;
  onPrepareSpeechAudio: (partIndex: number, blob: Blob) => void;
  onSubmitSpeech: (partIndex: number, transcript: string, blob: Blob | null) => Promise<void>;
}) => {
  return (
    <Stack sx={{ width: '100%' }} data-testid={`interactive-lesson-part-${partIndex}`}>
      {partIndex > 0 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />}
      <Stack
        sx={{
          gap: '4px',
          paddingTop: '36px',
          width: '100%',
        }}
      >
        <Stack sx={{}}>
          <LessonMarkdown content={part.contentMD} />
        </Stack>
        <Stack
          data-testid="interactive-lesson-read-play"
          sx={{
            alignItems: 'flex-start',
          }}
        >
          <AudioPlayIcon text={part.contentMD} />
        </Stack>
      </Stack>
      {part.type === 'speech' && (
        <SpeechAnswerPanel
          part={part}
          partIndex={partIndex}
          isEvaluating={isEvaluating}
          isOpenTalk={isOpenTalk}
          isReadAloud={isReadAloud}
          onAudioReady={(blob) => onPrepareSpeechAudio(partIndex, blob)}
          onSubmit={(transcript, blob) => onSubmitSpeech(partIndex, transcript, blob)}
        />
      )}
    </Stack>
  );
};
