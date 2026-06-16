'use client';

import { Stack, TextField, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { countWords, WritingTextQuestion } from '../../types';

export const WritingTextActivity = ({
  question,
  text,
  onTextChange,
  disabled,
}: {
  question: WritingTextQuestion;
  text: string;
  onTextChange: (value: string) => void;
  disabled?: boolean;
}) => {
  const { i18n } = useLingui();
  const wordCount = countWords(text);
  const isBelowMin = wordCount > 0 && wordCount < question.minWords;
  const isAboveMax = wordCount > question.maxWords;

  return (
    <Stack sx={{ gap: '20px' }}>
      {question.imageUrl && (
        <img
          src={question.imageUrl}
          alt={question.promptText}
          style={{ width: '100%', borderRadius: '12px' }}
        />
      )}

      <Typography variant="h6" sx={{ fontWeight: 600, whiteSpace: 'pre-wrap' }}>
        {question.promptText}
      </Typography>

      <Typography variant="body2" sx={{ color: '#EBEBF599' }}>
        {i18n._('Write between {minWords} and {maxWords} words.', {
          minWords: question.minWords,
          maxWords: question.maxWords,
        })}
      </Typography>

      <TextField
        multiline
        minRows={8}
        maxRows={20}
        fullWidth
        value={text}
        onChange={(event) => onTextChange(event.target.value)}
        disabled={disabled}
        placeholder={i18n._('Type your answer here...')}
        sx={{
          '& .MuiInputBase-root': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            color: '#EBEBF5',
          },
        }}
      />

      <Typography
        variant="body2"
        sx={{
          color: isBelowMin || isAboveMax ? '#ff8a80' : '#EBEBF599',
        }}
      >
        {i18n._('{count} words', { count: wordCount })}
        {isBelowMin &&
          ` · ${i18n._('At least {minWords} words required', { minWords: question.minWords })}`}
        {isAboveMax &&
          ` · ${i18n._('Maximum {maxWords} words', { maxWords: question.maxWords })}`}
      </Typography>
    </Stack>
  );
};
