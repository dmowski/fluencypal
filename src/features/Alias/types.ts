// Alias Game TypeScript Type Definitions

export type GameMode = 'free-for-all' | 'teams';

export type LanguageLevel = 'simple' | 'advanced';

export type TurnType = 'timed' | 'fixed-words';

export interface Player {
  id: string;
  name: string;
  teamId?: string;
  score: number;
}

export interface Team {
  id: string;
  name: string;
  playerIds: string[];
  score: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  words: {
    simple: string[];
    advanced: string[];
  };
}

export interface TurnSettings {
  type: TurnType;
  // For timed turns: duration in seconds (30, 60, 90)
  duration?: number;
  // For fixed-words turns: number of words (5, 10, 15)
  wordCount?: number;
}

export interface GameSettings {
  mode: GameMode;
  players: Player[];
  teams: Team[];
  languageLevel: LanguageLevel;
  selectedCategoryIds: string[];
  turnSettings: TurnSettings;
  numberOfRounds: number;
}

export interface WordAction {
  word: string;
  action: 'correct' | 'skip';
  timestamp: number;
}

export interface TurnState {
  playerId: string;
  teamId?: string;
  currentWord: string;
  wordsShown: string[];
  actions: WordAction[];
  correctCount: number;
  skipCount: number;
  score: number; // Net score for this turn (+1 for correct, -1 for skip)
  startTime: number;
  endTime?: number;
  isActive: boolean;
}

export interface RoundState {
  roundNumber: number;
  turns: TurnState[];
  isComplete: boolean;
}

export type GameScreen =
  | 'mode-selection'
  | 'players-setup'
  | 'language-level'
  | 'category-selection'
  | 'round-settings'
  | 'turn-start'
  | 'gameplay'
  | 'turn-summary'
  | 'game-end';

export interface GameState {
  screen: GameScreen;
  settings: GameSettings | null;
  rounds: RoundState[];
  currentRound: number;
  currentTurnIndex: number;
  availableWords: string[]; // Pool of words for the game
  usedWords: string[]; // Words already shown in current round
  skippedWords: string[]; // Words that were skipped (can reappear)
  isGameActive: boolean;
  winner?: string; // Player ID or Team ID
}

// Initial state templates
export const initialGameState: GameState = {
  screen: 'mode-selection',
  settings: null,
  rounds: [],
  currentRound: 0,
  currentTurnIndex: 0,
  availableWords: [],
  usedWords: [],
  skippedWords: [],
  isGameActive: false,
};

export const initialGameSettings: Partial<GameSettings> = {
  mode: 'free-for-all',
  players: [],
  teams: [],
  languageLevel: 'simple',
  selectedCategoryIds: [],
  turnSettings: {
    type: 'timed',
    duration: 60,
  },
  numberOfRounds: 3,
};
