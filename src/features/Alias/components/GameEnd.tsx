'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useGameState } from '../hooks/useGameState';

export const GameEnd: React.FC = () => {
  const { state, setScreen, initializeGame } = useGameState();

  const isTeamsMode = state.settings?.mode === 'teams';

  const finalScores = useMemo(() => {
    if (!state.settings) return [];

    if (isTeamsMode && state.settings.teams) {
      return state.settings.teams
        .map((team) => ({
          id: team.id,
          name: team.name,
          score: team.score,
          type: 'team' as const,
        }))
        .sort((a, b) => b.score - a.score);
    } else if (state.settings.players) {
      return state.settings.players
        .map((player) => ({
          id: player.id,
          name: player.name,
          score: player.score || 0,
          type: 'player' as const,
        }))
        .sort((a, b) => b.score - a.score);
    }

    return [];
  }, [state.settings, isTeamsMode]);

  const winner = finalScores[0];
  const totalTurnsPlayed = state.rounds.reduce((sum, round) => sum + round.turns.length, 0);
  const totalWordsAttempted = state.rounds.reduce(
    (sum, round) =>
      sum +
      round.turns.reduce((turnSum, turn) => turnSum + (turn.correctCount + turn.skipCount), 0),
    0,
  );
  const totalCorrect = state.rounds.reduce(
    (sum, round) => sum + round.turns.reduce((turnSum, turn) => turnSum + turn.correctCount, 0),
    0,
  );
  const accuracy =
    totalWordsAttempted > 0 ? Math.round((totalCorrect / totalWordsAttempted) * 100) : 0;

  const handlePlayAgain = () => {
    initializeGame();
    setScreen('mode-selection');
  };

  const handleNewGame = () => {
    initializeGame();
    setScreen('mode-selection');
  };

  return (
    <Container maxWidth="md" data-testid="game-end">
      <Stack spacing={4} sx={{ py: 4 }}>
        {/* Winner Section */}
        <Stack spacing={2} alignItems="center">
          <EmojiEventsIcon sx={{ fontSize: 80, color: '#ffd700' }} data-testid="winner-trophy" />
          <Stack spacing={1} alignItems="center">
            <Typography variant="h4" fontWeight="bold">
              Game Over!
            </Typography>
            <Typography variant="h5" color="primary" data-testid="winner-name">
              {winner?.name} wins!
            </Typography>
            <Typography variant="h6" data-testid="winner-score">
              Final Score: {winner?.score}
            </Typography>
          </Stack>
        </Stack>

        {/* Final Scoreboard */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Final Standings
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table data-testid="final-scoreboard">
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }} align="left">
                    Rank
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="left">
                    {isTeamsMode ? 'Team' : 'Player'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">
                    Score
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {finalScores.map((entry, index) => (
                  <TableRow
                    key={entry.id}
                    data-testid={`final-score-${entry.name}`}
                    sx={{
                      backgroundColor:
                        index === 0
                          ? 'rgba(255, 215, 0, 0.1)'
                          : index % 2 === 0
                            ? 'white'
                            : '#fafafa',
                    }}
                  >
                    <TableCell sx={{ fontWeight: index === 0 ? 'bold' : 'normal' }}>
                      #{index + 1} {index === 0 ? '👑' : ''}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: index === 0 ? 'bold' : 'normal',
                        color: index === 0 ? '#1976d2' : 'inherit',
                      }}
                    >
                      {entry.name}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: index === 0 ? 'bold' : 'normal',
                        fontSize: index === 0 ? '1.1rem' : '1rem',
                      }}
                    >
                      {entry.score}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Game Statistics */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Game Statistics
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Total Turns
                </Typography>
                <Typography variant="h5" fontWeight="bold" data-testid="stat-turns">
                  {totalTurnsPlayed}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Words Attempted
                </Typography>
                <Typography variant="h5" fontWeight="bold" data-testid="stat-words">
                  {totalWordsAttempted}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Accuracy
                </Typography>
                <Typography variant="h5" fontWeight="bold" data-testid="stat-accuracy">
                  {accuracy}%
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        {/* Action Buttons */}
        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handlePlayAgain}
            data-testid="button-play-again"
            sx={{ flex: 1 }}
          >
            Play Again
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={handleNewGame}
            data-testid="button-new-game"
            sx={{ flex: 1 }}
          >
            New Game
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
};
