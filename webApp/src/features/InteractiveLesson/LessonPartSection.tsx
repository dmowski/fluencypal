'use client';

import { Divider, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { SupportedLanguage } from '@/features/Lang/lang';
import { NewsContentWithParagraphs } from '@/features/News/NewsContentWithParagraphs';
import { SpeechAnswerPanel } from './SpeechAnswerPanel';
import { LessonPartState } from './types';

export const LessonPartSection = ({
  part,
  partIndex,
  languageCode,
  isEvaluating,
  onSubmitSpeech,
}: {
  part: LessonPartState;
  partIndex: number;
  languageCode: SupportedLanguage;
  isEvaluating: boolean;
  onSubmitSpeech: (partIndex: number, transcript: string, blob: Blob | null) => Promise<void>;
}) => {
  const { i18n } = useLingui();

  return (
    <Stack sx={{ gap: '16px', width: '100%' }} data-testid={`interactive-lesson-part-${partIndex}`}>
      {partIndex > 0 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />}
      <Typography
        variant="caption"
        sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.7 }}
      >
        {part.type === 'read' ? i18n._('Read') : i18n._('Speak')}
      </Typography>
      <NewsContentWithParagraphs content={part.contentMD} languageCode={languageCode} />
      {part.type === 'speech' && (
        <SpeechAnswerPanel
          part={part}
          partIndex={partIndex}
          isEvaluating={isEvaluating}
          onSubmit={(transcript, blob) => onSubmitSpeech(partIndex, transcript, blob)}
        />
      )}
    </Stack>
  );
};
