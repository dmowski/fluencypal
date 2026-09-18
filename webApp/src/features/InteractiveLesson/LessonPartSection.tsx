'use client';

import { Divider, Stack } from '@mui/material';
import { LessonMarkdown } from './LessonMarkdown';
import { PlayButton } from './PlayButton';
import { SpeechAnswerPanel } from './SpeechAnswerPanel';
import { LessonPartState } from './types';
import { lessonSx } from './lessonTheme';

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
      {partIndex > 0 && (
        <Divider sx={lessonSx.divider} />
      )}
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
        <Stack sx={{ alignItems: 'flex-start' }}>
          <PlayButton text={part.contentMD} testId="interactive-lesson-read-play" />
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
