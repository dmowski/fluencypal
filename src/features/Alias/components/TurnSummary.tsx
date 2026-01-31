'use client';

import { useMemo, useState } from 'react';
import { useLingui } from '@lingui/react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useGameState } from '../hooks/useGameState';

export const TurnSummary = () => {
  const { i18n } = useLingui();
  const {
    state,
    getCurrentTurn,
    getScores,
    getTeamScores,
    getWinner,
    setScreen,
    isRoundComplete,
    incrementRound,
    startRound,
    endRound,
    endGame,
  } = useGameState();
  const turn = getCurrentTurn();
  const isTeamsMode = state.settings?.mode === 'teams';
  const [showCorrectWords, setShowCorrectWords] = useState(false);

  const correctWords = useMemo(() => {
    if (!turn) return [];
    return turn.actions
      .filter((action) => action.action === 'correct')
      .map((action) => action.word);
  }, [turn]);

  const scoreEntries = useMemo(() => {
    if (!state.settings) return [];
    if (isTeamsMode) {
      const teamScores = getTeamScores();
      return teamScores.map((score) => {
        const name = state.settings?.teams.find((t) => t.id === score.teamId)?.name ?? i18n._('Team');
        return { id: score.teamId, name, score: score.score };
      });
    }

    const playerScores = getScores();
    return playerScores.map((score) => {
      const name = state.settings?.players.find((p) => p.id === score.playerId)?.name ?? i18n._('Player');
      return { id: score.playerId, name, score: score.score };
    });
  }, [getScores, getTeamScores, isTeamsMode, state.settings, i18n]);

  const handleNextTurn = () => {
    if (!state.settings) {
      setScreen('turn-start');
      return;
    }

    const totalRounds = state.settings.numberOfRounds ?? 1;
    const isComplete = isRoundComplete();

    if (isComplete) {
      endRound();

      if (state.currentRound >= totalRounds) {
        const winner = getWinner();
        endGame(winner?.id ?? '');
        return;
      }

      incrementRound();
      startRound();
    }

    setScreen('turn-start');
  };

  const handleViewScoreboard = () => {
    setScreen('scoreboard');
  };

  if (!turn || !state.settings) {
    return (
      <Container maxWidth="md" data-testid="turn-summary">
        <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
          <Typography variant="h4">{i18n._('Turn Summary')}</Typography>
          <Typography variant="body1" color="text.secondary">
            {i18n._('No turn data available.')}
          </Typography>
        </Stack>
      </Container>
    );
  }

  const playerName = state.settings?.players.find((p) => p.id === turn.playerId)?.name ?? i18n._('Player');
  const teamName = state.settings?.teams.find((t) => t.id === turn.teamId)?.name ?? i18n._('Team');

  const playerLabel = isTeamsMode ? teamName : playerName;

  return (
    <Container maxWidth="md" data-testid="turn-summary">
      <Stack spacing={4} sx={{ py: 4 }}>
        <Stack spacing={1} alignItems="center">
          <Typography variant="h4" fontWeight="bold" textAlign="center">
            {i18n._('Turn Summary')}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            data-testid="turn-summary-player"
          >
            {playerLabel}
          </Typography>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Box
            padding={2}
            borderRadius={2}
            sx={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
            data-testid="turn-summary-correct"
          >
            <Typography variant="subtitle2" color="text.secondary">
              {i18n._('Correct')}
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {turn.correctCount}
            </Typography>
          </Box>
          <Box
            padding={2}
            borderRadius={2}
            sx={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
            data-testid="turn-summary-skip"
          >
            <Typography variant="subtitle2" color="text.secondary">
              {i18n._('Skipped')}
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {turn.skipCount}
            </Typography>
          </Box>
          <Box
            padding={2}
            borderRadius={2}
            sx={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
            data-testid="turn-summary-score"
          >
            <Typography variant="subtitle2" color="text.secondary">
              {i18n._('Turn score')}
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {turn.score}
            </Typography>
          </Box>
        </Stack>

        <Divider />

        <Accordion
          expanded={showCorrectWords}
          onChange={() => setShowCorrectWords((prev) => !prev)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="medium">
              {i18n._(`Correct words ({count})`, { count: correctWords.length })}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {correctWords.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {i18n._('No correct words yet.')}
              </Typography>
            ) : (
              <Stack spacing={1} data-testid="turn-summary-correct-words">
                {correctWords.map((word, index) => (
                  <Typography key={`${word}-${index}`} variant="body2">
                    {word}
                  </Typography>
                ))}
              </Stack>
            )}
          </AccordionDetails>
        </Accordion>

        <Divider />

        <Stack spacing={2}>
          <Typography variant="h6" textAlign="center">
            {i18n._('Total Scores')}
          </Typography>
          <Stack spacing={1}>
            {scoreEntries.map((entry) => (
              <Box
                key={entry.id}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                padding={2}
                borderRadius={2}
                sx={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
                data-testid={`total-score-${entry.id}`}
              >
                <Typography variant="body1" fontWeight="medium">
                  {entry.name}
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {entry.score}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Stack>

        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleNextTurn}
            data-testid="turn-summary-next"
            sx={{ flex: 1 }}
          >
            {i18n._('Next Turn')}
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={handleViewScoreboard}
            data-testid="turn-summary-view-scoreboard"
            sx={{ flex: 1 }}
          >
            {i18n._('View Scoreboard')}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
};
