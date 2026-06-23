'use client';

import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';

export const SubmittedAnswerPreview = ({
  text,
  label,
}: {
  text: string;
  label?: string;
}) => {
  const { i18n } = useLingui();

  if (!text.trim()) return null;

  return (
    <Stack
      sx={{
        gap: '8px',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
      }}
      data-testid="submitted-answer-preview"
    >
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#EBEBF599' }}>
        {label ?? i18n._('Your answer')}
      </Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#EBEBF5' }}>
        {text}
      </Typography>
    </Stack>
  );
};
