'use client';

import { Box, Stack, Typography } from '@mui/material';
import { CheckCircle2 } from 'lucide-react';

export const AliasResultPreview = () => {
  return (
    <Stack
      sx={{
        width: '100%',
        maxWidth: '480px',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
        backgroundColor: '#10131a',
        color: '#f4f4f5',
      }}
      role="img"
      aria-label="Alias game result showing the AI guessed sunshine correctly with speaking feedback"
    >
      <Stack
        sx={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Typography sx={{ fontSize: '0.75rem', opacity: 0.65, textTransform: 'uppercase' }}>
          See the AI&apos;s Guess
        </Typography>
      </Stack>

      <Stack sx={{ padding: '24px 20px', gap: '18px' }}>
        <Stack sx={{ gap: '6px' }}>
          <Typography sx={{ fontSize: '0.8rem', opacity: 0.65 }}>AI guessed</Typography>
          <Typography sx={{ fontSize: '2rem', fontWeight: 800, textTransform: 'capitalize' }}>
            Sunshine
          </Typography>
        </Stack>

        <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={22} color="#22c55e" aria-hidden="true" />
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#22c55e' }}>
            Correct answer
          </Typography>
        </Stack>

        <Box
          sx={{
            backgroundColor: 'rgba(255,255,255,0.06)',
            borderRadius: '12px',
            padding: '14px 16px',
          }}
        >
          <Typography
            sx={{
              fontSize: '0.8rem',
              opacity: 0.65,
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Feedback
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', lineHeight: 1.55, opacity: 0.92 }}>
            You described the idea clearly and kept a natural pace. Try linking two related clues
            next round to stretch your vocabulary.
          </Typography>
        </Box>

        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignSelf: 'flex-start',
            padding: '10px 20px',
            borderRadius: '50px',
            border: '1px solid rgba(5, 172, 255, 0.5)',
            color: '#05acff',
            fontSize: '0.95rem',
            fontWeight: 600,
          }}
        >
          Try Another Word
        </Box>
      </Stack>
    </Stack>
  );
};
