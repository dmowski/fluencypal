'use client';

import { useGame } from '../context/GameContext';
import {
  GameScreen,
  GameSettings,
  Player,
  Team,
  TurnState,
  WordAction,
  initialGameSettings,
} from '../types';
import { categories } from '../data/categories';
import { buildInitialWordPool, pickNextWord, appendWordUsage } from '../utils/gameEngine';

export const useGameState = () => {
  const { state, dispatch } = useGame();

  // Navigation
  const setScreen = (screen: GameScreen) => {
    dispatch({ type: 'SET_SCREEN', payload: screen });
  };

  // Settings management
  const setSettings = (settings: GameSettings) => {
    dispatch({ type: 'SET_SETTINGS', payload: settings });
  };

  const updateSettings = (partialSettings: Partial<GameSettings>) => {
    if (!state.settings) {
      const baseSettings = initialGameSettings as GameSettings;
      dispatch({ type: 'SET_SETTINGS', payload: { ...baseSettings, ...partialSettings } });
      return;
    }

    dispatch({ type: 'UPDATE_SETTINGS', payload: partialSettings });
  };

  // Player management
  const addPlayer = (player: Player) => {
    dispatch({ type: 'ADD_PLAYER', payload: player });
  };

  const removePlayer = (playerId: string) => {
    dispatch({ type: 'REMOVE_PLAYER', payload: playerId });
  };

  const updatePlayer = (player: Player) => {
    dispatch({ type: 'UPDATE_PLAYER', payload: player });
  };

  // Team management
  const addTeam = (team: Team) => {
    dispatch({ type: 'ADD_TEAM', payload: team });
  };

  const updateTeam = (team: Team) => {
    dispatch({ type: 'UPDATE_TEAM', payload: team });
  };

  // Game flow
  const startGame = () => {
    if (!state.settings) return;

    const words = buildInitialWordPool(categories, state.settings);

    dispatch({ type: 'START_GAME', payload: { words } });
    dispatch({ type: 'START_ROUND' });
  };

  const startRound = () => {
    dispatch({ type: 'START_ROUND' });
  };

  const incrementRound = () => {
    dispatch({ type: 'INCREMENT_ROUND' });
  };

  const isRoundComplete = (): boolean => {
    if (!state.settings) return false;

    const currentRound = state.rounds[state.rounds.length - 1];
    if (!currentRound) return false;

    // Get the number of players or teams
    const numParticipants = state.settings.mode === 'teams'
      ? state.settings.teams.length
      : state.settings.players.length;

    // Check if all participants have had a turn in this round
    return currentRound.turns.length >= numParticipants;
  };

  const startTurn = (playerId: string, teamId?: string) => {
    const turn: TurnState = {
      playerId,
      teamId,
      currentWord: '',
      wordsShown: [],
      actions: [],
      correctCount: 0,
      skipCount: 0,
      score: 0,
      startTime: Date.now(),
      isActive: true,
    };

    dispatch({ type: 'START_TURN', payload: turn });
  };

  const endTurn = () => {
    dispatch({ type: 'END_TURN' });
  };

  const endRound = () => {
    dispatch({ type: 'END_ROUND' });
  };

  const endGame = (winner: string) => {
    dispatch({ type: 'END_GAME', payload: { winner } });
  };

  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  // Word management
  const getNextWord = (): string | null => {
    return pickNextWord(state.availableWords, state.usedWords, state.skippedWords);
  };

  const setCurrentWord = (word: string) => {
    dispatch({ type: 'SET_CURRENT_WORD', payload: word });
  };

  const recordCorrect = (word: string) => {
    const action: WordAction = {
      word,
      action: 'correct',
      timestamp: Date.now(),
    };
    dispatch({ type: 'RECORD_ACTION', payload: action });

    // Get and set next word
    const { usedWords, skippedWords } = appendWordUsage(
      state.usedWords,
      state.skippedWords,
      word,
      'correct',
    );
    const nextWord = pickNextWord(state.availableWords, usedWords, skippedWords);
    if (nextWord) {
      dispatch({ type: 'NEXT_WORD', payload: nextWord });
    }
  };

  const recordSkip = (word: string) => {
    const action: WordAction = {
      word,
      action: 'skip',
      timestamp: Date.now(),
    };
    dispatch({ type: 'RECORD_ACTION', payload: action });

    // Get and set next word
    const { usedWords, skippedWords } = appendWordUsage(
      state.usedWords,
      state.skippedWords,
      word,
      'skip',
    );
    const nextWord = pickNextWord(state.availableWords, usedWords, skippedWords);
    if (nextWord) {
      dispatch({ type: 'NEXT_WORD', payload: nextWord });
    }
  };

  // Getters
  const getCurrentTurn = (): TurnState | null => {
    const currentRound = state.rounds[state.rounds.length - 1];
    if (!currentRound) return null;

    const currentTurn = currentRound.turns[currentRound.turns.length - 1];
    return currentTurn || null;
  };

  const getCurrentPlayer = (): Player | null => {
    if (!state.settings) return null;

    const currentTurn = getCurrentTurn();
    if (!currentTurn || !currentTurn.isActive) {
      // Determine whose turn it should be
      const totalPlayers = state.settings.players.length;
      const playerIndex = state.currentTurnIndex % totalPlayers;
      return state.settings.players[playerIndex];
    }

    return state.settings.players.find((p) => p.id === currentTurn.playerId) || null;
  };

  const getCurrentTeam = (): Team | null => {
    if (!state.settings || state.settings.mode !== 'teams') return null;

    const currentTurn = getCurrentTurn();
    if (currentTurn && currentTurn.isActive && currentTurn.teamId) {
      return state.settings.teams.find((t) => t.id === currentTurn.teamId) || null;
    }

    const nextPlayer = getCurrentPlayer();
    if (!nextPlayer?.teamId) return null;

    return state.settings.teams.find((t) => t.id === nextPlayer.teamId) || null;
  };

  const getScores = (): { playerId: string; score: number }[] => {
    if (!state.settings) return [];

    const scores = state.settings.players.map((player) => {
      let totalScore = 0;

      state.rounds.forEach((round) => {
        round.turns.forEach((turn) => {
          if (turn.playerId === player.id) {
            totalScore += turn.score;
          }
        });
      });

      return { playerId: player.id, score: totalScore };
    });

    return scores;
  };

  const getTeamScores = (): { teamId: string; score: number }[] => {
    if (!state.settings || state.settings.mode !== 'teams') return [];

    const scores = state.settings.teams.map((team) => {
      let totalScore = 0;

      state.rounds.forEach((round) => {
        round.turns.forEach((turn) => {
          if (turn.teamId === team.id) {
            totalScore += turn.score;
          }
        });
      });

      return { teamId: team.id, score: totalScore };
    });

    return scores;
  };

  const getWinner = (): { type: 'player' | 'team'; id: string } | null => {
    if (!state.settings) return null;

    if (state.settings.mode === 'teams') {
      const teamScores = getTeamScores();
      if (teamScores.length === 0) return null;

      const winner = teamScores.reduce((prev, current) =>
        current.score > prev.score ? current : prev,
      );

      return { type: 'team', id: winner.teamId };
    } else {
      const playerScores = getScores();
      if (playerScores.length === 0) return null;

      const winner = playerScores.reduce((prev, current) =>
        current.score > prev.score ? current : prev,
      );

      return { type: 'player', id: winner.playerId };
    }
  };

  // Game initialization
  const initializeGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  return {
    // State
    state,

    // Navigation
    setScreen,

    // Settings
    setSettings,
    updateSettings,

    // Players
    addPlayer,
    removePlayer,
    updatePlayer,

    // Teams
    addTeam,
    updateTeam,

    // Game flow
    startGame,
    startRound,
    incrementRound,
    isRoundComplete,
    startTurn,
    endTurn,
    endRound,
    endGame,
    resetGame,

    // Words
    getNextWord,
    setCurrentWord,
    recordCorrect,
    recordSkip,

    // Getters
    getCurrentTurn,
    getCurrentPlayer,
    getCurrentTeam,
    getScores,
    getTeamScores,
    getWinner,

    // Game initialization
    initializeGame,
  };
};
