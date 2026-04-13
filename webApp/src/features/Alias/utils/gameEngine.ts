import { Category, GameSettings, RoundState, TurnState } from '../types';
import { buildWordPool, getNextWord, shuffleWords } from './wordManager';

export const createInitialRounds = (numberOfRounds: number): RoundState[] => {
  return Array.from({ length: numberOfRounds }, (_, index) => ({
    roundNumber: index + 1,
    turns: [],
    isComplete: false,
  }));
};

export const buildInitialWordPool = (categories: Category[], settings: GameSettings): string[] => {
  return buildWordPool(categories, settings.selectedCategoryIds, settings.languageLevel);
};

export const pickNextWord = (
  availableWords: string[],
  usedWords: string[],
  skippedWords: string[],
): string | null => {
  return getNextWord(availableWords, usedWords, skippedWords);
};

export const appendWordUsage = (
  usedWords: string[],
  skippedWords: string[],
  word: string,
  action: 'correct' | 'skip',
): { usedWords: string[]; skippedWords: string[] } => {
  const updatedUsed = [...usedWords, word];
  if (action === 'skip') {
    return { usedWords: updatedUsed, skippedWords: [...skippedWords, word] };
  }
  return { usedWords: updatedUsed, skippedWords };
};

export const createTurnState = (playerId: string, teamId?: string): TurnState => ({
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
});

export const shuffleTurnOrder = (turnOrder: Array<{ playerId: string; teamId?: string }>) => {
  return shuffleWords(turnOrder.map((entry) => JSON.stringify(entry))).map(
    (item) => JSON.parse(item) as { playerId: string; teamId?: string },
  );
};
