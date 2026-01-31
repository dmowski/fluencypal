'use client';

import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import {
  GameState,
  GameSettings,
  GameScreen,
  Player,
  Team,
  TurnState,
  RoundState,
  WordAction,
  initialGameState,
} from '../types';

const STORAGE_KEY = 'alias-game-state-v1';

const isBrowser = () => typeof window !== 'undefined';

const isValidGameState = (value: unknown): value is GameState => {
  if (!value || typeof value !== 'object') return false;
  const state = value as GameState;

  return (
    typeof state.screen === 'string' &&
    typeof state.currentRound === 'number' &&
    typeof state.currentTurnIndex === 'number' &&
    Array.isArray(state.rounds) &&
    Array.isArray(state.availableWords) &&
    Array.isArray(state.usedWords) &&
    Array.isArray(state.skippedWords) &&
    typeof state.isGameActive === 'boolean'
  );
};

const loadPersistedState = (): GameState | null => {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    return isValidGameState(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const persistState = (state: GameState) => {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore write errors (quota, disabled storage, etc.)
  }
};

// Action types
type GameAction =
  | { type: 'SET_SCREEN'; payload: GameScreen }
  | { type: 'SET_SETTINGS'; payload: GameSettings }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GameSettings> }
  | { type: 'ADD_PLAYER'; payload: Player }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'UPDATE_PLAYER'; payload: Player }
  | { type: 'ADD_TEAM'; payload: Team }
  | { type: 'UPDATE_TEAM'; payload: Team }
  | { type: 'START_GAME'; payload: { words: string[] } }
  | { type: 'START_ROUND' }
  | { type: 'START_TURN'; payload: TurnState }
  | { type: 'UPDATE_TURN'; payload: Partial<TurnState> }
  | { type: 'END_TURN' }
  | { type: 'INCREMENT_ROUND' }
  | { type: 'RECORD_ACTION'; payload: WordAction }
  | { type: 'SET_CURRENT_WORD'; payload: string }
  | { type: 'NEXT_WORD'; payload: string }
  | { type: 'END_ROUND' }
  | { type: 'END_GAME'; payload: { winner: string } }
  | { type: 'RESET_GAME' }
  | { type: 'RESTORE_STATE'; payload: GameState };

// Reducer function
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.payload };

    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: state.settings ? { ...state.settings, ...action.payload } : null,
      };

    case 'ADD_PLAYER':
      return {
        ...state,
        settings: state.settings
          ? {
              ...state.settings,
              players: [...state.settings.players, action.payload],
            }
          : null,
      };

    case 'REMOVE_PLAYER':
      return {
        ...state,
        settings: state.settings
          ? {
              ...state.settings,
              players: state.settings.players.filter((p) => p.id !== action.payload),
            }
          : null,
      };

    case 'UPDATE_PLAYER':
      return {
        ...state,
        settings: state.settings
          ? {
              ...state.settings,
              players: state.settings.players.map((p) =>
                p.id === action.payload.id ? action.payload : p,
              ),
            }
          : null,
      };

    case 'ADD_TEAM':
      return {
        ...state,
        settings: state.settings
          ? {
              ...state.settings,
              teams: [...state.settings.teams, action.payload],
            }
          : null,
      };

    case 'UPDATE_TEAM':
      return {
        ...state,
        settings: state.settings
          ? {
              ...state.settings,
              teams: state.settings.teams.map((t) =>
                t.id === action.payload.id ? action.payload : t,
              ),
            }
          : null,
      };

    case 'START_GAME':
      return {
        ...state,
        isGameActive: true,
        availableWords: action.payload.words,
        usedWords: [],
        skippedWords: [],
        currentRound: 1,
        currentTurnIndex: 0,
        rounds: [],
        screen: 'turn-start',
      };

    case 'START_ROUND':
      const newRound: RoundState = {
        roundNumber: state.currentRound,
        turns: [],
        isComplete: false,
      };
      return {
        ...state,
        rounds: [...state.rounds, newRound],
        currentTurnIndex: 0,
        usedWords: [],
        skippedWords: [],
      };

    case 'START_TURN':
      const currentRound = state.rounds[state.rounds.length - 1];
      if (!currentRound) return state;

      const updatedRound = {
        ...currentRound,
        turns: [...currentRound.turns, action.payload],
      };

      return {
        ...state,
        rounds: [...state.rounds.slice(0, -1), updatedRound],
        screen: 'gameplay',
      };

    case 'UPDATE_TURN':
      const activeRound = state.rounds[state.rounds.length - 1];
      if (!activeRound) return state;

      const activeTurn = activeRound.turns[activeRound.turns.length - 1];
      if (!activeTurn) return state;

      const updatedTurn = { ...activeTurn, ...action.payload };
      const updatedTurns = [...activeRound.turns.slice(0, -1), updatedTurn];

      return {
        ...state,
        rounds: [...state.rounds.slice(0, -1), { ...activeRound, turns: updatedTurns }],
      };

    case 'RECORD_ACTION':
      const round = state.rounds[state.rounds.length - 1];
      if (!round) return state;

      const turn = round.turns[round.turns.length - 1];
      if (!turn) return state;

      const newAction = action.payload;
      const newActions = [...turn.actions, newAction];
      const correctCount =
        newAction.action === 'correct' ? turn.correctCount + 1 : turn.correctCount;
      const skipCount = newAction.action === 'skip' ? turn.skipCount + 1 : turn.skipCount;
      const score = correctCount - skipCount;

      const updatedActiveTurn = {
        ...turn,
        actions: newActions,
        correctCount,
        skipCount,
        score,
        wordsShown: [...turn.wordsShown, newAction.word],
      };

      return {
        ...state,
        rounds: [
          ...state.rounds.slice(0, -1),
          {
            ...round,
            turns: [...round.turns.slice(0, -1), updatedActiveTurn],
          },
        ],
        usedWords: [...state.usedWords, newAction.word],
        skippedWords:
          newAction.action === 'skip'
            ? [...state.skippedWords, newAction.word]
            : state.skippedWords,
      };

    case 'SET_CURRENT_WORD':
      return {
        ...state,
        rounds: state.rounds.map((r, idx) =>
          idx === state.rounds.length - 1
            ? {
                ...r,
                turns: r.turns.map((t, tIdx) =>
                  tIdx === r.turns.length - 1 ? { ...t, currentWord: action.payload } : t,
                ),
              }
            : r,
        ),
      };

    case 'NEXT_WORD':
      return {
        ...state,
        rounds: state.rounds.map((r, idx) =>
          idx === state.rounds.length - 1
            ? {
                ...r,
                turns: r.turns.map((t, tIdx) =>
                  tIdx === r.turns.length - 1 ? { ...t, currentWord: action.payload } : t,
                ),
              }
            : r,
        ),
      };

    case 'END_TURN':
      const endRound = state.rounds[state.rounds.length - 1];
      if (!endRound) return state;

      const endTurn = endRound.turns[endRound.turns.length - 1];
      if (!endTurn) return state;

      const finishedTurn = {
        ...endTurn,
        isActive: false,
        endTime: Date.now(),
      };

      return {
        ...state,
        rounds: [
          ...state.rounds.slice(0, -1),
          {
            ...endRound,
            turns: [...endRound.turns.slice(0, -1), finishedTurn],
          },
        ],
        currentTurnIndex: state.currentTurnIndex + 1,
        screen: 'turn-summary',
      };

    case 'INCREMENT_ROUND':
      return {
        ...state,
        currentRound: state.currentRound + 1,
      };

    case 'END_ROUND':
      const completedRound = state.rounds[state.rounds.length - 1];
      if (!completedRound) return state;

      return {
        ...state,
        rounds: [...state.rounds.slice(0, -1), { ...completedRound, isComplete: true }],
      };

    case 'END_GAME':
      return {
        ...state,
        isGameActive: false,
        winner: action.payload.winner,
        screen: 'game-end',
      };

    case 'RESET_GAME':
      return initialGameState;

    case 'RESTORE_STATE':
      // Restore the full state from localStorage
      return action.payload;

    default:
      return state;
  }
};

// Context
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Load persisted state after hydration to avoid mismatch
  useEffect(() => {
    const persistedState = loadPersistedState();
    if (persistedState) {
      dispatch({ type: 'RESTORE_STATE', payload: persistedState });
    }
    setIsHydrated(true);
  }, []);

  // Persist state only after hydration is complete
  useEffect(() => {
    if (isHydrated) {
      persistState(state);
    }
  }, [state, isHydrated]);

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
};

// Hook to use the game context
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
