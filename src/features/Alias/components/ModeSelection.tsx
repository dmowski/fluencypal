'use client';

import { Stack, Typography, Button, Box, Container } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import { useGameState } from '../hooks/useGameState';
import { GameMode, initialGameSettings } from '../types';

export const ModeSelection = () => {
  const { updateSettings, setScreen } = useGameState();

  const handleModeSelect = (mode: GameMode) => {
    updateSettings({
      ...initialGameSettings,
      mode,
    });
    setScreen('players-setup');
  };

  return (
    <Container maxWidth="md">
      <Stack
        spacing={4}
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: '80vh', py: 4 }}
      >
        <Stack spacing={2} alignItems="center">
          <Typography variant="h3" component="h1" fontWeight="bold" textAlign="center">
            Alias Game
          </Typography>
          <Typography variant="h6" color="text.secondary" textAlign="center" sx={{ maxWidth: 500 }}>
            Choose your game mode
          </Typography>
        </Stack>

        <Stack
          spacing={3}
          sx={{
            width: '100%',
            maxWidth: 500,
          }}
        >
          <Button
            data-testid="mode-free-for-all"
            variant="contained"
            size="large"
            onClick={() => handleModeSelect('free-for-all')}
            sx={{
              py: 4,
              px: 3,
              fontSize: '1.25rem',
              borderRadius: 2,
              textTransform: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <PersonIcon sx={{ fontSize: 48 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Free-for-All
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Every player competes individually
              </Typography>
            </Box>
          </Button>

          <Button
            data-testid="mode-teams"
            variant="contained"
            size="large"
            onClick={() => handleModeSelect('teams')}
            sx={{
              py: 4,
              px: 3,
              fontSize: '1.25rem',
              borderRadius: 2,
              textTransform: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <GroupsIcon sx={{ fontSize: 48 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Teams
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Players compete in teams
              </Typography>
            </Box>
          </Button>
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ maxWidth: 400, mt: 2 }}
        >
          A fun word guessing game for 2-20 players. Explain words to your teammates without saying
          the word itself!
        </Typography>
      </Stack>
    </Container>
  );
};
