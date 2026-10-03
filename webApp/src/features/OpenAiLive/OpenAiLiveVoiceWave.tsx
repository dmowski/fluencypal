'use client';

import { Box } from '@mui/material';

const WAVE_BARS = [
  { h: 12, d: '-0.2s', o: 0.35 },
  { h: 24, d: '-1.2s', o: 0.5 },
  { h: 42, d: '-0.7s', o: 0.85 },
  { h: 64, d: '-1.7s', o: 0.85 },
  { h: 84, d: '-0.4s', o: 0.85 },
  { h: 54, d: '-1.1s', o: 0.85 },
  { h: 35, d: '-2s', o: 0.85 },
  { h: 62, d: '-0.8s', o: 0.85 },
  { h: 42, d: '-1.4s', o: 0.85 },
  { h: 22, d: '-2.4s', o: 0.5 },
  { h: 10, d: '-1s', o: 0.35 },
];

export const OpenAiLiveVoiceWave = () => (
  <Box
    aria-hidden
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '5px',
      flex: '0 0 115px',
      height: '100px',
      marginLeft: 'auto',
      position: 'relative',
      '&:before': {
        content: '""',
        position: 'absolute',
        inset: '5px -8px',
        borderRadius: '50%',
        background: '#22baff10',
        filter: 'blur(12px)',
      },
      '@keyframes openAiLiveWave': {
        '0%, 100%': { transform: 'scaleY(0.65)' },
        '50%': { transform: 'scaleY(1)' },
      },
      '@media (max-width:520px)': {
        flexBasis: '60px',
        gap: '3px',
        '& span:nth-of-type(even)': { display: 'none' },
      },
      '@media (prefers-reduced-motion: reduce)': {
        '& span': { animation: 'none' },
      },
    }}
  >
    {WAVE_BARS.map((bar) => (
      <Box
        key={`${bar.h}-${bar.d}`}
        component="span"
        sx={{
          display: 'block',
          width: '3px',
          height: `${bar.h}px`,
          borderRadius: '3px',
          background: 'linear-gradient(#98e8ff, #25b9f0)',
          opacity: bar.o,
          transformOrigin: 'center',
          animation: 'openAiLiveWave 3.1s ease-in-out infinite',
          animationDelay: bar.d,
        }}
      />
    ))}
  </Box>
);
