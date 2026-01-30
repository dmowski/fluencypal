'use client';

import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { useGameState } from '../hooks/useGameState';

export const Scoreboard: React.FC = () => {
  const { getCurrentPlayer, getCurrentTeam, state, setScreen } = useGameState();

  const currentPlayer = getCurrentPlayer();
  const currentTeam = getCurrentTeam();
  const isTeamsMode = state.settings?.mode === 'teams';

  // Get sorted scores data
  const getScoresData = () => {
    if (isTeamsMode && state.settings?.teams) {
      return state.settings.teams
        .map((team) => ({
          id: team.id,
          name: team.name,
          score: team.score,
          isCurrentTeam: currentTeam?.id === team.id,
          type: 'team' as const,
        }))
        .sort((a, b) => b.score - a.score);
    } else if (state.settings?.players) {
      return state.settings.players
        .map((player) => ({
          id: player.id,
          name: player.name,
          score: player.score || 0,
          isCurrentPlayer: currentPlayer?.id === player.id,
          type: 'player' as const,
        }))
        .sort((a, b) => b.score - a.score);
    }
    return [];
  };

  const scoresData = getScoresData();

  return (
    <Box sx={{ p: 2 }}>
      <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
            Scoreboard
          </Typography>

          <TableContainer component={Paper} variant="outlined" data-testid="scoreboard-table">
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: '60%', pr: 1 }} align="left">
                    {isTeamsMode ? 'Team' : 'Player'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '40%', pr: 1 }} align="right">
                    Score
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scoresData.map((entry, index) => {
                  const isHighlight =
                    (isTeamsMode && entry.type === 'team' && entry.isCurrentTeam) ||
                    (!isTeamsMode && entry.type === 'player' && entry.isCurrentPlayer);

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
                          backgroundColor: isHighlight ? 'rgba(33, 150, 243, 0.15)' : '#f0f0f0',
                        },
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <TableCell sx={{ pr: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: isHighlight ? 'bold' : 'normal',
                              color: isHighlight ? '#1976d2' : 'inherit',
                            }}
                          >
                            {entry.name}
                          </Typography>
                          {isHighlight && (
                            <Chip label="Now" size="small" color="primary" variant="outlined" />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: isHighlight ? 'bold' : 'normal',
                          fontSize: isHighlight ? '1.1rem' : '1rem',
                          color: isHighlight ? '#1976d2' : 'inherit',
                          pr: 1,
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

          <Typography variant="caption" sx={{ mt: 2, display: 'block', color: '#666' }}>
            Round: {state.currentRound} / {state.settings?.numberOfRounds}
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => setScreen('turn-start')}
            data-testid="scoreboard-next"
            sx={{ mt: 3 }}
          >
            Next Turn
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};
