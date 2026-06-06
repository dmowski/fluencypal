'use client';

import { Stack, Typography } from '@mui/material';
import { WordTranslationQuestion } from '../../types';
import { QuizOptionList } from '../QuizOptionList';

export const WordTranslationActivity = ({
  question,
  selectedOptionId,
  onSelect,
  isRevealed,
}: {
  question: WordTranslationQuestion;
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
  isRevealed?: boolean;
}) => (
  <Stack sx={{ gap: '20px' }}>
    <Typography variant="h5" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
      {question.promptText}
    </Typography>
    <QuizOptionList
      options={question.options}
      selectedOptionId={selectedOptionId}
      onSelect={onSelect}
      isRevealed={isRevealed}
      correctOptionId={isRevealed ? question.correctOptionId : null}
    />
  </Stack>
);
