'use client';

import { Button, Stack } from '@mui/material';
import { QuizOption } from '../types';

export const QuizOptionList = ({
  options,
  selectedOptionId,
  onSelect,
  disabled,
}: {
  options: QuizOption[];
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
}) => (
  <Stack sx={{ gap: '10px', width: '100%' }}>
    {options.map((option) => {
      const isSelected = selectedOptionId === option.id;
      return (
        <Button
          key={option.id}
          variant={isSelected ? 'contained' : 'outlined'}
          color={isSelected ? 'info' : 'inherit'}
          disabled={disabled}
          onClick={() => onSelect(option.id)}
          data-testid={`quiz-option-${option.id}`}
          sx={{
            justifyContent: 'flex-start',
            textAlign: 'left',
            textTransform: 'capitalize',
            padding: '12px 16px',
            fontWeight: 500,
            border: isSelected ? '1px solid transparent' : '1px solid rgba(255,255,255,0.2)',
          }}
        >
          {option.label}
        </Button>
      );
    })}
  </Stack>
);
