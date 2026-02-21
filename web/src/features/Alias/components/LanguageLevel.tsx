'use client';

import { useLingui } from '@lingui/react';
import { Container, Stack, Typography, Button, Box } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { useGameState } from '../hooks/useGameState';
import { initialGameSettings } from '../types';

export const LanguageLevel = () => {
  const { i18n } = useLingui();
  const { state, updateSettings, setScreen } = useGameState();

  const currentLevel = state.settings?.languageLevel ?? initialGameSettings.languageLevel;

  const handleSelect = (level: 'simple' | 'advanced') => {
    updateSettings({ languageLevel: level });
  };

  const handleBack = () => {
    setScreen('players-setup');
  };

  const handleContinue = () => {
    setScreen('category-selection');
  };

  return (
    <Container maxWidth="md" data-testid="language-level">
      <Stack spacing={4} alignItems="center" sx={{ py: 4 }}>
        <Stack spacing={1} alignItems="center">
          <Typography variant="h4" fontWeight="bold" textAlign="center">
            {i18n._('Choose Language Level')}
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            {i18n._('Pick a difficulty that matches your group.')}
          </Typography>
        </Stack>

        <Stack spacing={3} sx={{ width: '100%', maxWidth: 520 }}>
          <Button
            data-testid="language-simple"
            variant={currentLevel === 'simple' ? 'contained' : 'outlined'}
            size="large"
            aria-pressed={currentLevel === 'simple'}
            onClick={() => handleSelect('simple')}
            sx={{
              py: 3,
              textTransform: 'none',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <SchoolIcon sx={{ fontSize: 40 }} />
            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold">
                {i18n._('Simple')}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {i18n._('Shorter words and familiar vocabulary')}
              </Typography>
            </Box>
          </Button>

          <Button
            data-testid="language-advanced"
            variant={currentLevel === 'advanced' ? 'contained' : 'outlined'}
            size="large"
            aria-pressed={currentLevel === 'advanced'}
            onClick={() => handleSelect('advanced')}
            sx={{
              py: 3,
              textTransform: 'none',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <RocketLaunchIcon sx={{ fontSize: 40 }} />
            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold">
                {i18n._('Advanced')}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {i18n._('Longer words and richer expressions')}
              </Typography>
            </Box>
          </Button>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width="100%" maxWidth={520}>
          <Button variant="outlined" onClick={handleBack} fullWidth data-testid="language-back">
            {i18n._('Back')}
          </Button>
          <Button
            variant="contained"
            onClick={handleContinue}
            fullWidth
            data-testid="language-continue"
          >
            {i18n._('Continue')}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
};
