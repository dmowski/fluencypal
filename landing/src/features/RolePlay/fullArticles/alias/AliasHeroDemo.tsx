'use client';

import { Box, Stack, Typography } from '@mui/material';
import { CheckCircle2, Mic } from 'lucide-react';

const DEMO_HEIGHT = 420;

const waveformBars = [12, 28, 18, 36, 22, 40, 16, 32, 24, 38, 14, 30, 20, 34, 18, 26];

export const AliasHeroDemo = () => {
  return (
    <Stack
      aria-hidden="true"
      sx={{
        width: '100%',
        maxWidth: '420px',
        minHeight: DEMO_HEIGHT,
        height: DEMO_HEIGHT,
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.18)',
        backgroundColor: '#10131a',
        color: '#f4f4f5',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <Stack
        sx={{
          padding: '16px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography sx={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase' }}>
          Alias game
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', opacity: 0.7 }}>Intermediate</Typography>
      </Stack>

      <Box
        sx={{
          flex: 1,
          position: 'relative',
          padding: '20px 18px 24px',
        }}
      >
        {/* Phase 1: word appears */}
        <Stack
          className="alias-demo-phase"
          sx={{
            position: 'absolute',
            inset: '20px 18px 24px',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            opacity: 0,
            animation: 'aliasDemoWord 12s ease-in-out infinite',
            '@keyframes aliasDemoWord': {
              '0%, 8%': { opacity: 1 },
              '20%, 100%': { opacity: 0 },
            },
          }}
        >
          <Typography sx={{ fontSize: '0.8rem', opacity: 0.65 }}>Your word</Typography>
          <Typography
            sx={{
              fontSize: '2.4rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            Sunshine
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', opacity: 0.7, textAlign: 'center' }}>
            Describe it without saying the word
          </Typography>
        </Stack>

        {/* Phase 2: recording + waveform */}
        <Stack
          className="alias-demo-phase"
          sx={{
            position: 'absolute',
            inset: '20px 18px 24px',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '18px',
            opacity: 0,
            animation: 'aliasDemoRecord 12s ease-in-out infinite',
            '@keyframes aliasDemoRecord': {
              '0%, 18%': { opacity: 0 },
              '22%, 42%': { opacity: 1 },
              '50%, 100%': { opacity: 0 },
            },
          }}
        >
          <Stack
            sx={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'aliasDemoPulse 1.2s ease-in-out infinite',
              '@keyframes aliasDemoPulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.06)' },
              },
            }}
          >
            <Mic size={28} color="#ef4444" />
          </Stack>
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>Describe It Aloud</Typography>
          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              gap: '4px',
              height: '48px',
            }}
          >
            {waveformBars.map((height, index) => (
              <Box
                key={index}
                sx={{
                  width: '5px',
                  borderRadius: '3px',
                  backgroundColor: '#05acff',
                  height: `${height}px`,
                  animation: `aliasWave ${0.8 + (index % 4) * 0.15}s ease-in-out infinite alternate`,
                  '@keyframes aliasWave': {
                    '0%': { transform: 'scaleY(0.45)' },
                    '100%': { transform: 'scaleY(1)' },
                  },
                }}
              />
            ))}
          </Stack>
        </Stack>

        {/* Phase 3: AI guess */}
        <Stack
          sx={{
            position: 'absolute',
            inset: '20px 18px 24px',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: '10px',
            opacity: 0,
            animation: 'aliasDemoGuess 12s ease-in-out infinite',
            '@keyframes aliasDemoGuess': {
              '0%, 48%': { opacity: 0 },
              '52%, 68%': { opacity: 1 },
              '74%, 100%': { opacity: 0 },
            },
          }}
        >
          <Typography sx={{ fontSize: '0.75rem', opacity: 0.6 }}>AI partner</Typography>
          <Box
            sx={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '14px 16px',
              maxWidth: '100%',
            }}
          >
            <Typography sx={{ fontSize: '1rem', lineHeight: 1.5 }}>
              Hmm… is it <strong>sunshine</strong>?
            </Typography>
          </Box>
        </Stack>

        {/* Phase 4: result + feedback */}
        <Stack
          sx={{
            position: 'absolute',
            inset: '20px 18px 24px',
            justifyContent: 'center',
            gap: '14px',
            opacity: 0,
            animation: 'aliasDemoResult 12s ease-in-out infinite',
            '@keyframes aliasDemoResult': {
              '0%, 72%': { opacity: 0 },
              '78%, 96%': { opacity: 1 },
              '100%': { opacity: 0 },
            },
          }}
        >
          <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={22} color="#22c55e" />
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#22c55e' }}>
              Correct!
            </Typography>
          </Stack>
          <Box
            sx={{
              backgroundColor: 'rgba(5, 172, 255, 0.12)',
              border: '1px solid rgba(5, 172, 255, 0.25)',
              borderRadius: '12px',
              padding: '12px 14px',
            }}
          >
            <Typography sx={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.9 }}>
              Clear, natural description. You explained brightness and warmth without using the word.
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: '0.85rem',
              color: '#05acff',
              fontWeight: 600,
            }}
          >
            Try Another Word →
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
};
