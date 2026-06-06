'use client';

import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { AudioPlayIcon } from '@/features/Audio/AudioPlayIcon';
import { ListeningQuestion } from '../../types';
import { QuizOptionList } from '../QuizOptionList';

export const ListeningActivity = ({
  question,
  selectedOptionId,
  onSelect,
  isRevealed,
}: {
  question: ListeningQuestion;
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
  isRevealed?: boolean;
}) => {
  const { i18n } = useLingui();

  return (
    <Stack sx={{ gap: '20px' }}>
      <Stack sx={{ gap: '12px', alignItems: 'flex-start' }}>
        <AudioPlayIcon cache text={question.audioText} type="button" buttonLabel={i18n._('Play')} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {question.questionText}
        </Typography>
      </Stack>

      <QuizOptionList
        options={question.options}
        selectedOptionId={selectedOptionId}
        onSelect={onSelect}
        isRevealed={isRevealed}
        correctOptionId={isRevealed ? question.correctOptionId : null}
      />
    </Stack>
  );
};
