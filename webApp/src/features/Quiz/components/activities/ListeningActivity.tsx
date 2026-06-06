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
  disabled,
}: {
  question: ListeningQuestion;
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
}) => {
  const { i18n } = useLingui();

  return (
    <Stack sx={{ gap: '20px' }}>
      <Stack sx={{ gap: '12px' }}>
        <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
          {question.audioText}
        </Typography>
        <AudioPlayIcon text={question.audioText} type="button" buttonLabel={i18n._('Play')} />
      </Stack>
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
};
