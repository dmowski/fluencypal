'use client';

import { Stack, Typography } from '@mui/material';
import { ReadAndAnswerQuestion } from '../../types';
import { QuizOptionList } from '../QuizOptionList';

export const ReadAndAnswerActivity = ({
  question,
  selectedOptionId,
  onSelect,
  isRevealed,
}: {
  question: ReadAndAnswerQuestion;
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
  isRevealed?: boolean;
}) => (
  <Stack sx={{ gap: '20px' }}>
    <Typography variant="body1" sx={{ lineHeight: 1.6, opacity: 0.95, fontSize: '22px' }}>
      {question.passageText}
    </Typography>
    <Typography variant="h4" sx={{ fontWeight: 600 }}>
      {question.questionText}
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
