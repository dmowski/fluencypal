'use client';

import { Stack, Typography } from '@mui/material';
import { GameProvider } from './context/GameContext';

export const AliasPage = () => {
  return (
    <GameProvider>
      <Stack>
        <Typography variant="h4" gutterBottom>
          Alias Game
        </Typography>
      </Stack>
    </GameProvider>
  );
};
