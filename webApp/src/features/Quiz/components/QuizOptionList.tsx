'use client';

import { Button, Stack } from '@mui/material';
import { QuizOption } from '../types';

const CORRECT_COLOR = '#5bdf94';
const INCORRECT_COLOR = '#e4b8b4';

const getRevealedOptionSx = (isSelected: boolean, isCorrect: boolean): Record<string, unknown> => {
  if (isCorrect) {
    return {
      border: `1px solid ${CORRECT_COLOR}`,
      backgroundColor: isSelected ? CORRECT_COLOR : 'rgba(91, 223, 148, 0.15)',
      color: isSelected ? '#1a1a1a' : '#EBEBF5',
      '&:hover': {
        backgroundColor: isSelected ? CORRECT_COLOR : 'rgba(91, 223, 148, 0.15)',
      },
    };
  }

  if (isSelected) {
    return {
      border: `1px solid ${INCORRECT_COLOR}`,
      backgroundColor: 'rgba(228, 184, 180, 0.2)',
      color: '#EBEBF5',
      '&:hover': {
        backgroundColor: 'rgba(228, 184, 180, 0.2)',
      },
    };
  }

  return {
    border: '1px solid rgba(255,255,255,0.2)',
    opacity: 0.65,
    '&:hover': {
      backgroundColor: 'transparent',
    },
  };
};

export const QuizOptionList = ({
  options,
  selectedOptionId,
  onSelect,
  disabled,
  isRevealed,
  correctOptionId,
}: {
  options: QuizOption[];
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
  isRevealed?: boolean;
  correctOptionId?: string | null;
}) => (
  <Stack sx={{ gap: '10px', width: '100%' }}>
    {options.map((option) => {
      const isSelected = selectedOptionId === option.id;
      const isCorrect = Boolean(isRevealed && correctOptionId && option.id === correctOptionId);

      return (
        <Button
          key={option.id}
          variant={isRevealed ? 'outlined' : isSelected ? 'contained' : 'outlined'}
          color={isRevealed ? 'inherit' : isSelected ? 'info' : 'inherit'}
          disabled={disabled && !isRevealed}
          onClick={() => {
            if (!isRevealed && !disabled) onSelect(option.id);
          }}
          data-testid={`quiz-option-${option.id}`}
          data-selected={isSelected || undefined}
          data-correct={isCorrect || undefined}
          sx={{
            justifyContent: 'flex-start',
            textAlign: 'left',
            padding: '12px 16px',
            fontWeight: 500,
            fontSize: '18px',
            cursor: isRevealed ? 'default' : undefined,
            ...(isRevealed
              ? getRevealedOptionSx(isSelected, isCorrect)
              : {
                  border: isSelected ? '1px solid transparent' : '1px solid rgba(255,255,255,0.2)',
                }),
          }}
        >
          {option.label}
        </Button>
      );
    })}
  </Stack>
);
