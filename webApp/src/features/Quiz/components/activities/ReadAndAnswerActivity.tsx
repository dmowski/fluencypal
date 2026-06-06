'use client';

import { Stack, Typography } from '@mui/material';
import { ReadAndAnswerQuestion } from '../../types';
import { QuizOptionList } from '../QuizOptionList';

export const ReadAndAnswerActivity = ({
  question,
  selectedOptionId,
  onSelect,
  disabled,
}: {
  question: ReadAndAnswerQuestion;
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
}) => (
  <Stack sx={{ gap: '20px' }}>
    <Typography variant="body1" sx={{ lineHeight: 1.6, opacity: 0.95 }}>
      {question.passageText}
    </Typography>
    <Typography variant="h6" sx={{ fontWeight: 600 }}>
      {question.questionText}
    </Typography>
    <QuizOptionList
      options={question.options}
      selectedOptionId={selectedOptionId}
      onSelect={onSelect}
      disabled={disabled}
    />
  </Stack>
);
