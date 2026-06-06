'use client';

import { Stack, Typography } from '@mui/material';
import { WordTranslationQuestion } from '../../types';
import { QuizOptionList } from '../QuizOptionList';

export const WordTranslationActivity = ({
  question,
  selectedOptionId,
  onSelect,
  disabled,
}: {
  question: WordTranslationQuestion;
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
}) => (
  <Stack sx={{ gap: '20px' }}>
    <Typography variant="h6" sx={{ fontWeight: 600 }}>
      {question.promptText}
    </Typography>
    <QuizOptionList
      options={question.options}
      selectedOptionId={selectedOptionId}
      onSelect={onSelect}
      disabled={disabled}
    />
  </Stack>
);
