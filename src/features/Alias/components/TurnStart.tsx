'use client';

import { useMemo } from 'react';
import { Container, Stack, Typography, Button, Divider, Box } from '@mui/material';
import { useGameState } from '../hooks/useGameState';

export const TurnStart = () => {
  const { state, getCurrentPlayer, getCurrentTeam, getScores, getTeamScores, startTurn } =
    useGameState();

  const player = getCurrentPlayer();
  const team = getCurrentTeam();
  const isTeamsMode = state.settings?.mode === 'teams';
  const roundNumber = state.currentRound || 1;
  const totalRounds = state.settings?.numberOfRounds ?? 1;

  const scores = useMemo(() => {
    if (!state.settings) return [];
    if (isTeamsMode) {
      const teamScores = getTeamScores();
      return teamScores.map((score) => {
        const teamName = state.settings?.teams.find((t) => t.id === score.teamId)?.name ?? 'Team';
        return { id: score.teamId, name: teamName, score: score.score };
      });
    }

    const playerScores = getScores();
    return playerScores.map((score) => {
      const playerName =
        state.settings?.players.find((p) => p.id === score.playerId)?.name ?? 'Player';
      return { id: score.playerId, name: playerName, score: score.score };
    });
  }, [getScores, getTeamScores, isTeamsMode, state.settings]);

  const handleStartTurn = () => {
    if (!player) return;
    startTurn(player.id, team?.id);
  };

  if (!state.settings) {
    return (
      <Container maxWidth="md" data-testid="turn-start">
        <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
          <Typography variant="h4">Turn Start</Typography>
          <Typography variant="body1" color="text.secondary">
            Game settings are missing. Please go back.
          </Typography>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" data-testid="turn-start">
      <Stack spacing={4} sx={{ py: 4 }} alignItems="center">
        <Stack spacing={1} alignItems="center">
          <Typography variant="h4" fontWeight="bold" textAlign="center">
            Get Ready
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            Round {roundNumber} of {totalRounds}
          </Typography>
        </Stack>

        <Stack spacing={1} alignItems="center">
          <Typography variant="subtitle1" color="text.secondary">
            {isTeamsMode ? 'Team' : 'Player'} up next
          </Typography>
          <Typography
            variant="h3"
            fontWeight="bold"
            data-testid="turn-start-player"
            textAlign="center"
          >
            {isTeamsMode ? (team?.name ?? 'Team') : (player?.name ?? 'Player')}
          </Typography>
          {isTeamsMode && player && (
            <Typography variant="body1" color="text.secondary">
              {player.name}
            </Typography>
          )}
        </Stack>

        <Divider flexItem />

        <Stack spacing={2} width="100%" maxWidth={520}>
          <Typography variant="h6" textAlign="center">
            Current Scores
          </Typography>
          <Stack spacing={1}>
            {scores.map((entry) => (
              <Box
                key={entry.id}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                padding={2}
                borderRadius={2}
                sx={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
                data-testid={`score-${entry.id}`}
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

        <Button
          variant="contained"
          size="large"
          onClick={handleStartTurn}
          data-testid="turn-start-button"
        >
          Start Turn
        </Button>
      </Stack>
    </Container>
  );
};
