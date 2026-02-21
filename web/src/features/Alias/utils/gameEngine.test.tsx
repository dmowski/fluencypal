import '@testing-library/jest-dom';
import {
  createInitialRounds,
  buildInitialWordPool,
  pickNextWord,
  appendWordUsage,
  createTurnState,
  shuffleTurnOrder,
} from './gameEngine';
import { Category, GameSettings, TurnType } from '../types';

describe('Game Engine', () => {
  describe('createInitialRounds', () => {
    it('should create correct number of rounds', () => {
      const rounds = createInitialRounds(3);

      expect(rounds).toHaveLength(3);
    });

    it('should create rounds with correct round numbers', () => {
      const rounds = createInitialRounds(4);

      expect(rounds[0].roundNumber).toBe(1);
      expect(rounds[1].roundNumber).toBe(2);
      expect(rounds[2].roundNumber).toBe(3);
      expect(rounds[3].roundNumber).toBe(4);
    });

    it('should initialize rounds with empty turns', () => {
      const rounds = createInitialRounds(2);

      rounds.forEach((round) => {
        expect(round.turns).toEqual([]);
        expect(round.isComplete).toBe(false);
      });
    });

    it('should handle single round', () => {
      const rounds = createInitialRounds(1);

      expect(rounds).toHaveLength(1);
      expect(rounds[0].roundNumber).toBe(1);
    });
  });

  describe('buildInitialWordPool', () => {
    const mockCategories: Category[] = [
      {
        id: 'animals',
        name: 'Animals',
        description: 'Animal words',
        words: {
          simple: ['cat', 'dog', 'bird'],
          advanced: ['elephant', 'giraffe', 'zebra'],
        },
      },
      {
        id: 'food',
        name: 'Food',
        description: 'Food words',
        words: {
          simple: ['apple', 'bread'],
          advanced: ['asparagus', 'broccoli'],
        },
      },
    ];

    const mockSettings: GameSettings = {
      mode: 'free-for-all',
      players: [],
      teams: [],
      languageLevel: 'simple',
      selectedCategoryIds: ['animals', 'food'],
      turnSettings: { type: 'timed', duration: 60 },
      numberOfRounds: 1,
    };

    it('should build word pool from categories and settings', () => {
      const pool = buildInitialWordPool(mockCategories, mockSettings);

      expect(pool.length).toBe(5); // 3 from animals + 2 from food
      ['cat', 'dog', 'bird', 'apple', 'bread'].forEach((word) => {
        expect(pool).toContain(word);
      });
    });

    it('should respect language level setting', () => {
      const advancedSettings: GameSettings = {
        ...mockSettings,
        languageLevel: 'advanced',
      };

      const pool = buildInitialWordPool(mockCategories, advancedSettings);

      ['elephant', 'giraffe', 'zebra', 'asparagus', 'broccoli'].forEach((word) => {
        expect(pool).toContain(word);
      });
    });

    it('should use selected category IDs', () => {
      const partialSettings: GameSettings = {
        ...mockSettings,
        selectedCategoryIds: ['animals'],
      };

      const pool = buildInitialWordPool(mockCategories, partialSettings);

      expect(pool).toHaveLength(3);
      expect(pool).toContain('cat');
      expect(pool).not.toContain('apple');
    });
  });

  describe('pickNextWord', () => {
    const availableWords = ['word1', 'word2', 'word3', 'word4', 'word5'];

    it('should pick an unused word', () => {
      const word = pickNextWord(availableWords, ['word1'], []);

      expect(availableWords).toContain(word);
      expect(word).not.toBe('word1');
    });

    it('should return null when no words available', () => {
      const word = pickNextWord(availableWords, availableWords, []);

      expect(word).toBeNull();
    });
  });

  describe('appendWordUsage', () => {
    it('should append word to used words on correct action', () => {
      const result = appendWordUsage(['word1'], [], 'word2', 'correct');

      expect(result.usedWords).toContain('word1');
      expect(result.usedWords).toContain('word2');
      expect(result.usedWords).toHaveLength(2);
      expect(result.skippedWords).toHaveLength(0);
    });

    it('should append word to both used and skipped on skip action', () => {
      const result = appendWordUsage(['word1'], ['skipped1'], 'word2', 'skip');

      expect(result.usedWords).toContain('word1');
      expect(result.usedWords).toContain('word2');
      expect(result.usedWords).toHaveLength(2);
      expect(result.skippedWords).toContain('skipped1');
      expect(result.skippedWords).toContain('word2');
      expect(result.skippedWords).toHaveLength(2);
    });

    it('should not modify original arrays', () => {
      const usedWords = ['word1'];
      const skippedWords = ['skipped1'];
      const usedWordsLength = usedWords.length;
      const skippedWordsLength = skippedWords.length;

      appendWordUsage(usedWords, skippedWords, 'word2', 'correct');

      expect(usedWords).toHaveLength(usedWordsLength);
      expect(skippedWords).toHaveLength(skippedWordsLength);
    });

    it('should handle empty arrays', () => {
      const result = appendWordUsage([], [], 'word1', 'correct');

      expect(result.usedWords).toEqual(['word1']);
      expect(result.skippedWords).toEqual([]);
    });
  });

  describe('createTurnState', () => {
    it('should create turn state with required fields', () => {
      const now = Date.now();
      const turn = createTurnState('player-1');

      expect(turn.playerId).toBe('player-1');
      expect(turn.currentWord).toBe('');
      expect(turn.wordsShown).toEqual([]);
      expect(turn.actions).toEqual([]);
      expect(turn.correctCount).toBe(0);
      expect(turn.skipCount).toBe(0);
      expect(turn.score).toBe(0);
      expect(turn.isActive).toBe(true);
      expect(turn.startTime).toBeGreaterThanOrEqual(now);
    });

    it('should include team ID when provided', () => {
      const turn = createTurnState('player-1', 'team-1');

      expect(turn.teamId).toBe('team-1');
    });

    it('should not include team ID when not provided', () => {
      const turn = createTurnState('player-1');

      expect(turn.teamId).toBeUndefined();
    });

    it('should have consistent initial state', () => {
      const turn1 = createTurnState('p1');
      const turn2 = createTurnState('p1');

      expect(turn1.currentWord).toBe(turn2.currentWord);
      expect(turn1.correctCount).toBe(turn2.correctCount);
      expect(turn1.skipCount).toBe(turn2.skipCount);
      expect(turn1.isActive).toBe(turn2.isActive);
    });
  });

  describe('shuffleTurnOrder', () => {
    it('should return array of same length', () => {
      const turnOrder = [
        { playerId: 'p1', teamId: 't1' },
        { playerId: 'p2', teamId: 't1' },
        { playerId: 'p3', teamId: 't2' },
      ];

      const shuffled = shuffleTurnOrder(turnOrder);

      expect(shuffled).toHaveLength(turnOrder.length);
    });

    it('should contain all original entries', () => {
      const turnOrder = [
        { playerId: 'p1', teamId: 't1' },
        { playerId: 'p2', teamId: 't1' },
        { playerId: 'p3', teamId: 't2' },
      ];

      const shuffled = shuffleTurnOrder(turnOrder);

      turnOrder.forEach((entry) => {
        expect(
          shuffled.some((s) => s.playerId === entry.playerId && s.teamId === entry.teamId),
        ).toBe(true);
      });
    });

    it('should not modify original array', () => {
      const turnOrder = [
        { playerId: 'p1', teamId: 't1' },
        { playerId: 'p2', teamId: 't1' },
      ];
      const originalFirst = turnOrder[0];

      shuffleTurnOrder(turnOrder);

      expect(turnOrder[0]).toEqual(originalFirst);
    });

    it('should handle single entry', () => {
      const turnOrder = [{ playerId: 'p1' }];
      const shuffled = shuffleTurnOrder(turnOrder);

      expect(shuffled).toHaveLength(1);
      expect(shuffled[0].playerId).toBe('p1');
    });

    it('should handle empty array', () => {
      const shuffled = shuffleTurnOrder([]);

      expect(shuffled).toEqual([]);
    });
  });
});
