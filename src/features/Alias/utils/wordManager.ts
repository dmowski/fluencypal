import { LanguageLevel } from '../types';
import { Category, Player, Team } from '../types';

export const shuffleWords = (words: string[]): string[] => {
  const copy = [...words];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const buildWordPool = (
  categories: Category[],
  selectedCategoryIds: string[],
  level: LanguageLevel,
): string[] => {
  const selected = categories.filter((category) => selectedCategoryIds.includes(category.id));
  const words = selected.flatMap((category) => category.words[level]);
  return shuffleWords(words);
};

export const getNextWord = (
  availableWords: string[],
  usedWords: string[],
  skippedWords: string[],
): string | null => {
  const usedSet = new Set(usedWords);
  const skippedSet = new Set(skippedWords);

  const unused = availableWords.filter((word) => !usedSet.has(word));
  if (unused.length > 0) {
    return unused[Math.floor(Math.random() * unused.length)];
  }

  const availableSkipped = availableWords.filter((word) => skippedSet.has(word));
  if (availableSkipped.length > 0) {
    return availableSkipped[Math.floor(Math.random() * availableSkipped.length)];
  }

  return null;
};

export const getTurnOrder = (
  mode: 'free-for-all' | 'teams',
  players: Player[],
  teams: Team[],
): Array<{ playerId: string; teamId?: string }> => {
  if (mode === 'teams') {
    const order: Array<{ playerId: string; teamId?: string }> = [];
    teams.forEach((team) => {
      team.playerIds.forEach((playerId) => {
        order.push({ playerId, teamId: team.id });
      });
    });
    return order;
  }

  return players.map((player) => ({ playerId: player.id }));
};
