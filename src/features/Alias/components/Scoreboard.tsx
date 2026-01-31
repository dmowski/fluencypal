'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
import { useGameState } from '../hooks/useGameState';

export const Scoreboard: React.FC = () => {
  const { state, getCurrentPlayer, getCurrentTeam, setScreen } = useGameState();

  const currentPlayer = getCurrentPlayer();
  const currentTeam = getCurrentTeam();
  const isTeamsMode = state.settings?.mode === 'teams';

  const scoresData = useMemo(() => {
    if (!state.settings) return [];

    if (isTeamsMode && state.settings.teams) {
      return state.settings.teams
        .map((team) => ({
          id: team.id,
          name: team.name,
          score: team.score,
          isCurrent: currentTeam?.id === team.id,
          type: 'team' as const,
        }))
        .sort((a, b) => b.score - a.score);
    } else if (state.settings.players) {
      return state.settings.players
        .map((player) => ({
          id: player.id,
          name: player.name,
          score: player.score || 0,
          isCurrent: currentPlayer?.id === player.id,
          type: 'player' as const,
        }))
        .sort((a, b) => b.score - a.score);
    }

    return [];
  }, [state.settings, currentPlayer, currentTeam, isTeamsMode]);

  const handleContinue = () => {
    setScreen('turn-start');
  };

  return (
    <Container maxWidth="md" data-testid="scoreboard">
      <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
        <CardContent>
          <Stack spacing={3} sx={{ py: 2 }}>
            <Stack spacing={1} alignItems="center">
              <Typography variant="h5" fontWeight="bold">
                Scoreboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Round {state.currentRound} / {state.settings?.numberOfRounds}
              </Typography>
            </Stack>

            <TableContainer component={Paper} variant="outlined">
              <Table data-testid="scoreboard-table">
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
                  {scoresData.map((entry, index) => {
                    const isHighlight = entry.isCurrent;

                    return (
                      <TableRow
                        key={entry.id}
                        data-testid={`scoreboard-row-${entry.name}`}
                        sx={{
                          backgroundColor: isHighlight
                            ? 'rgba(33, 150, 243, 0.1)'
                            : index % 2 === 0
                              ? 'white'
                              : '#fafafa',
                          '&:hover': {
                            backgroundColor: isHighlight
                              ? 'rgba(33, 150, 243, 0.15)'
                              : '#f0f0f0',
                          },
                          transition: 'background-color 0.2s',
                        }}
                      >
                        <TableCell
                          sx={{
                            fontWeight: isHighlight ? 'bold' : 'normal',
                            color: isHighlight ? '#1976d2' : 'inherit',
                            width: '60px',
                          }}
                        >
                          #{index + 1}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: isHighlight ? 'bold' : 'normal',
                            color: isHighlight ? '#1976d2' : 'inherit',
                          }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2">{entry.name}</Typography>
                            {isHighlight && (
                              <Chip
                                label="Now"
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: isHighlight ? 'bold' : 'normal',
                            fontSize: isHighlight ? '1.1rem' : '1rem',
                            color: isHighlight ? '#1976d2' : 'inherit',
                          }}
                          data-testid={`scoreboard-score-${entry.name}`}
                        >
                          {entry.score}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Button
              variant="contained"
              size="large"
              onClick={handleContinue}
              data-testid="scoreboard-continue"
              fullWidth
            >
              Continue to Next Turn
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};
