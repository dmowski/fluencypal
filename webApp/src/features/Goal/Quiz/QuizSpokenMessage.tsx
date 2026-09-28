'use client';

import { Stack, Typography } from '@mui/material';

export const QuizSpokenMessage = ({ label, text }: { label: string; text: string }) => {
  return (
    <Stack
      data-testid="quiz-spoken-message"
      sx={{
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
        maxWidth: '100%',
        gap: '4px',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          opacity: 0.5,
          paddingRight: '4px',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          padding: '14px 16px',
          borderRadius: '16px 16px 4px 16px',
          backgroundColor: 'rgba(147, 197, 253, 0.16)',
          lineHeight: 1.45,
          whiteSpace: 'pre-wrap',
        }}
      >
        {text}
      </Typography>
    </Stack>
  );
};

export const PracticeReasonExampleList = ({
  heading,
  examples,
}: {
  heading: string;
  examples: string[];
}) => {
  if (!examples.length) return null;

  return (
    <Stack data-testid="quiz-reason-examples" sx={{ gap: '10px' }}>
      <Typography variant="body2" sx={{ opacity: 0.7 }}>
        {heading}
      </Typography>
      {examples.map((example) => (
        <Typography
          key={example}
          variant="body2"
          sx={{
            padding: '12px 14px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            lineHeight: 1.45,
          }}
        >
          {example}
        </Typography>
      ))}
    </Stack>
  );
};
