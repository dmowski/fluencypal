'use client';

import { useMemo } from 'react';
import { useLingui } from '@lingui/react';
import {
  Container,
  Stack,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
} from '@mui/material';
import { useGameState } from '../hooks/useGameState';
import { initialGameSettings } from '../types';

const timedOptions = [30, 60, 90];
const wordCountOptions = [5, 10, 15];
const roundOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const RoundSettings = () => {
  const { i18n } = useLingui();
  const { state, updateSettings, setScreen, startGame } = useGameState();

  const turnSettings = state.settings?.turnSettings ?? initialGameSettings.turnSettings;
  const numberOfRounds = state.settings?.numberOfRounds ?? initialGameSettings.numberOfRounds;

  const isTimed = turnSettings?.type === 'timed';
  const selectedDuration = turnSettings?.duration ?? 60;
  const selectedWordCount = turnSettings?.wordCount ?? 10;

  const roundText =
    numberOfRounds === 1
      ? i18n._('1 round')
      : i18n._('{numberOfRounds} rounds', { numberOfRounds });

  const summary = isTimed
    ? roundText +
      ', ' +
      i18n._(`{durationInSecond}s per turn`, {
        durationInSecond: selectedDuration,
      })
    : roundText + ', ' + selectedWordCount + ' ' + i18n._(`words per turn`);

  const handleTurnTypeChange = (_: unknown, value: 'timed' | 'fixed-words' | null) => {
    if (!value) return;
    if (value === 'timed') {
      updateSettings({
        turnSettings: {
          type: 'timed',
          duration: selectedDuration ?? 60,
        },
      });
      return;
    }

    updateSettings({
      turnSettings: {
        type: 'fixed-words',
        wordCount: selectedWordCount ?? 10,
      },
    });
  };

  const handleDurationChange = (_: unknown, value: number | null) => {
    if (!value) return;
    updateSettings({
      turnSettings: {
        type: 'timed',
        duration: value,
      },
    });
  };

  const handleWordCountChange = (_: unknown, value: number | null) => {
    if (!value) return;
    updateSettings({
      turnSettings: {
        type: 'fixed-words',
        wordCount: value,
      },
    });
  };

  const handleRoundsChange = (_: unknown, value: number | null) => {
    if (!value) return;
    updateSettings({ numberOfRounds: value });
  };

  const handleBack = () => {
    setScreen('category-selection');
  };

  const handleStart = () => {
    if (!state.settings) {
      setScreen('turn-start');
      return;
    }
    startGame();
  };

  return (
    <Container maxWidth="md" data-testid="round-settings">
      <Stack spacing={4} sx={{ py: 4 }}>
        <Stack spacing={1} alignItems="center">
          <Typography variant="h4" fontWeight="bold" textAlign="center">
            {i18n._('Round Settings')}
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            {i18n._('Choose how long each turn lasts and how many rounds to play.')}
          </Typography>
        </Stack>

        <Stack spacing={2}>
          <Typography variant="h6" fontWeight="medium">
            {i18n._('Turn type')}
          </Typography>
          <ToggleButtonGroup
            value={turnSettings?.type ?? 'timed'}
            exclusive
            onChange={handleTurnTypeChange}
            data-testid="turn-type"
          >
            <ToggleButton
              value="timed"
              data-testid="turn-type-timed"
              sx={{
                textTransform: 'none',
              }}
            >
              {i18n._('Timed')}
            </ToggleButton>
            <ToggleButton
              value="fixed-words"
              data-testid="turn-type-fixed"
              sx={{
                textTransform: 'none',
              }}
            >
              {i18n._('Fixed words')}
            </ToggleButton>
          </ToggleButtonGroup>

          {isTimed ? (
            <Stack spacing={2}>
              <Typography variant="subtitle1">{i18n._('Duration')}</Typography>
              <ToggleButtonGroup
                value={selectedDuration}
                exclusive
                onChange={handleDurationChange}
                data-testid="turn-duration"
              >
                {timedOptions.map((option) => (
                  <ToggleButton
                    key={option}
                    value={option}
                    data-testid={`duration-${option}`}
                    sx={{
                      textTransform: 'none',
                    }}
                  >
                    {i18n._(`{duration}s`, { duration: option })}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Typography variant="subtitle1">{i18n._('Words per turn')}</Typography>
              <ToggleButtonGroup
                value={selectedWordCount}
                exclusive
                onChange={handleWordCountChange}
                data-testid="turn-word-count"
              >
                {wordCountOptions.map((option) => (
                  <ToggleButton
                    key={option}
                    value={option}
                    data-testid={`word-count-${option}`}
                    sx={{
                      textTransform: 'none',
                    }}
                  >
                    {i18n._(`{count} words`, { count: option })}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Stack>
          )}
        </Stack>

        <Divider />

        <Stack spacing={2}>
          <Typography variant="h6" fontWeight="medium">
            {i18n._('Number of rounds')}
          </Typography>
          <ToggleButtonGroup
            value={numberOfRounds}
            exclusive
            onChange={handleRoundsChange}
            data-testid="round-count"
          >
            {roundOptions.map((option) => (
              <ToggleButton key={option} value={option} data-testid={`rounds-${option}`}>
                {option}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          {i18n._(`Summary:`)} {summary}
        </Typography>

        <Divider />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
          <Button variant="outlined" onClick={handleBack} data-testid="round-settings-back">
            {i18n._('Back')}
          </Button>
          <Button variant="contained" onClick={handleStart} data-testid="round-settings-start">
            {i18n._('Start game')}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
};
