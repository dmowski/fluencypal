'use client';

import React, { useEffect, useMemo } from 'react';
import {
  Stack,
  Typography,
  Container,
  TextField,
  IconButton,
  Button,
  Box,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useGameState } from '../hooks/useGameState';
import { GameSettings, Player, Team, initialGameSettings } from '../types';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 20;

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createPlayer = (index: number, teamId?: string): Player => ({
  id: createId('player'),
  name: `Player ${index}`,
  teamId,
  score: 0,
});

const createTeam = (index: number): Team => ({
  id: createId('team'),
  name: `Team ${String.fromCharCode(65 + index)}`,
  playerIds: [],
  score: 0,
});

const assignTeamsToPlayers = (players: Player[], teams: Team[]): Player[] => {
  if (teams.length === 0) return players;

  return players.map((player, index) => ({
    ...player,
    teamId:
      player.teamId && teams.some((t) => t.id === player.teamId)
        ? player.teamId
        : teams[index % teams.length].id,
  }));
};

const syncTeamPlayerIds = (players: Player[], teams: Team[]): Team[] =>
  teams.map((team) => ({
    ...team,
    playerIds: players.filter((p) => p.teamId === team.id).map((p) => p.id),
  }));

export const PlayersSetup = () => {
  const { state, setSettings, setScreen } = useGameState();

  const settings = state.settings as GameSettings | null;

  useEffect(() => {
    const needsInit =
      !settings ||
      settings.players.length === 0 ||
      (settings.mode === 'teams' && settings.teams.length < 2);

    if (!needsInit) return;

    const baseSettings = (settings ?? (initialGameSettings as GameSettings)) as GameSettings;
    let players = baseSettings.players;
    let teams = baseSettings.teams;

    if (!players || players.length < MIN_PLAYERS) {
      players = Array.from({ length: MIN_PLAYERS }, (_, index) => createPlayer(index + 1));
    }

    if (baseSettings.mode === 'teams') {
      if (!teams || teams.length < 2) {
        teams = [createTeam(0), createTeam(1)];
      }
      players = assignTeamsToPlayers(players, teams);
      teams = syncTeamPlayerIds(players, teams);
    } else {
      teams = [];
      players = players.map((player) => ({ ...player, teamId: undefined }));
    }

    setSettings({ ...baseSettings, players, teams });
  }, [settings, setSettings]);

  const players = settings?.players ?? [];
  const teams = settings?.teams ?? [];
  const isTeamsMode = settings?.mode === 'teams';

  const validation = useMemo(() => {
    const validCount = players.length >= MIN_PLAYERS && players.length <= MAX_PLAYERS;
    const validNames = players.every((player) => player.name.trim().length > 0);
    const validTeams = !isTeamsMode || players.every((player) => player.teamId);

    return {
      canContinue: validCount && validNames && validTeams,
      validCount,
      validNames,
    };
  }, [players, isTeamsMode]);

  const handlePlayerNameChange = (playerId: string, name: string) => {
    if (!settings) return;

    const updatedPlayers = players.map((player) =>
      player.id === playerId ? { ...player, name } : player,
    );

    const updatedTeams = isTeamsMode ? syncTeamPlayerIds(updatedPlayers, teams) : [];
    setSettings({ ...settings, players: updatedPlayers, teams: updatedTeams });
  };

  const handleAddPlayer = () => {
    if (!settings || players.length >= MAX_PLAYERS) return;

    let teamId: string | undefined;
    if (isTeamsMode && teams.length > 0) {
      const teamCounts = teams.map((team) => ({
        teamId: team.id,
        count: players.filter((player) => player.teamId === team.id).length,
      }));
      teamId = teamCounts.sort((a, b) => a.count - b.count)[0]?.teamId;
    }

    const newPlayer = createPlayer(players.length + 1, teamId);
    const updatedPlayers = [...players, newPlayer];
    const updatedTeams = isTeamsMode ? syncTeamPlayerIds(updatedPlayers, teams) : [];

    setSettings({ ...settings, players: updatedPlayers, teams: updatedTeams });
  };

  const handleRemovePlayer = (playerId: string) => {
    if (!settings || players.length <= MIN_PLAYERS) return;

    const updatedPlayers = players.filter((player) => player.id !== playerId);
    const updatedTeams = isTeamsMode ? syncTeamPlayerIds(updatedPlayers, teams) : [];

    setSettings({ ...settings, players: updatedPlayers, teams: updatedTeams });
  };

  const handleTeamChange = (playerId: string, teamId: string) => {
    if (!settings) return;

    const updatedPlayers = players.map((player) =>
      player.id === playerId ? { ...player, teamId } : player,
    );
    const updatedTeams = syncTeamPlayerIds(updatedPlayers, teams);

    setSettings({ ...settings, players: updatedPlayers, teams: updatedTeams });
  };

  const handleTeamNameChange = (teamId: string, name: string) => {
    if (!settings) return;

    const updatedTeams = teams.map((team) => (team.id === teamId ? { ...team, name } : team));

    setSettings({ ...settings, teams: updatedTeams });
  };

  const handleBack = () => {
    setScreen('mode-selection');
  };

  const handleContinue = () => {
    if (!validation.canContinue) return;
    setScreen('language-level');
  };

  return (
    <Container maxWidth="md" data-testid="players-setup">
      <Stack spacing={4} sx={{ py: 4 }}>
        <Stack spacing={1} alignItems="center">
          <Typography variant="h4" fontWeight="bold">
            Players Setup
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            Add between 2 and 20 players. Tap a name to edit it.
          </Typography>
        </Stack>

        {isTeamsMode && teams.length > 0 && (
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight="medium">
              Teams
            </Typography>
            <Stack spacing={2}>
              {teams.map((team, index) => (
                <TextField
                  key={team.id}
                  label={`Team ${index + 1} name`}
                  value={team.name}
                  onChange={(event) => handleTeamNameChange(team.id, event.target.value)}
                  fullWidth
                  data-testid={`team-name-${index}`}
                />
              ))}
            </Stack>
          </Stack>
        )}

        <Divider />

        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="medium">
              Players ({players.length}/{MAX_PLAYERS})
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddPlayer}
              disabled={players.length >= MAX_PLAYERS}
              data-testid="add-player"
            >
              Add player
            </Button>
          </Stack>

          <Stack spacing={2}>
            {players.map((player, index) => (
              <Box
                key={player.id}
                display="grid"
                gridTemplateColumns={
                  isTeamsMode ? { xs: '1fr', md: '1fr 200px 48px' } : { xs: '1fr 48px' }
                }
                gap={2}
                alignItems="center"
              >
                <TextField
                  label={`Player ${index + 1}`}
                  value={player.name}
                  onChange={(event) => handlePlayerNameChange(player.id, event.target.value)}
                  fullWidth
                  data-testid={`player-name-${index}`}
                />

                {isTeamsMode && (
                  <FormControl fullWidth>
                    <InputLabel id={`team-select-label-${player.id}`}>Team</InputLabel>
                    <Select
                      labelId={`team-select-label-${player.id}`}
                      value={player.teamId ?? ''}
                      label="Team"
                      onChange={(event) => handleTeamChange(player.id, event.target.value)}
                      data-testid={`player-team-${index}`}
                    >
                      {teams.map((team) => (
                        <MenuItem key={team.id} value={team.id}>
                          {team.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <IconButton
                  aria-label="Remove player"
                  onClick={() => handleRemovePlayer(player.id)}
                  disabled={players.length <= MIN_PLAYERS}
                  data-testid={`player-remove-${index}`}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Stack>

          {!validation.validCount && (
            <Typography variant="body2" color="error">
              You need between {MIN_PLAYERS} and {MAX_PLAYERS} players.
            </Typography>
          )}

          {!validation.validNames && (
            <Typography variant="body2" color="error">
              Please enter a name for every player.
            </Typography>
          )}
        </Stack>

        <Divider />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            data-testid="players-back"
          >
            Back
          </Button>
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={handleContinue}
            disabled={!validation.canContinue}
            data-testid="players-continue"
          >
            Continue
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
};
