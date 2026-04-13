import '@testing-library/jest-dom';
import { shuffleWords, buildWordPool, getNextWord, getTurnOrder } from './wordManager';
import { Category, Player, Team } from '../types';

describe('Word Manager', () => {
  describe('shuffleWords', () => {
    it('should return an array of the same length', () => {
      const words = ['apple', 'banana', 'cherry', 'date', 'fig'];
      const shuffled = shuffleWords(words);

      expect(shuffled).toHaveLength(words.length);
    });

    it('should contain all original elements', () => {
      const words = ['apple', 'banana', 'cherry', 'date', 'fig'];
      const shuffled = shuffleWords(words);

      words.forEach((word) => {
        expect(shuffled).toContain(word);
      });
    });

    it('should not modify the original array', () => {
      const words = ['apple', 'banana', 'cherry'];
      const originalLength = words.length;
      const originalFirst = words[0];

      shuffleWords(words);

      expect(words).toHaveLength(originalLength);
      expect(words[0]).toBe(originalFirst);
    });

    it('should handle empty array', () => {
      const words: string[] = [];
      const shuffled = shuffleWords(words);

      expect(shuffled).toEqual([]);
    });

    it('should handle single element', () => {
      const words = ['apple'];
      const shuffled = shuffleWords(words);

      expect(shuffled).toEqual(['apple']);
    });
  });

  describe('buildWordPool', () => {
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
          simple: ['apple', 'bread', 'milk'],
          advanced: ['asparagus', 'broccoli', 'caviar'],
        },
      },
      {
        id: 'sports',
        name: 'Sports',
        description: 'Sports words',
        words: {
          simple: ['run', 'jump', 'play'],
          advanced: ['badminton', 'volleyball', 'archery'],
        },
      },
    ];

    it('should build word pool with simple level', () => {
      const selectedIds = ['animals', 'food'];
      const pool = buildWordPool(mockCategories, selectedIds, 'simple');

      expect(pool).toContain('cat');
      expect(pool).toContain('dog');
      expect(pool).toContain('apple');
      expect(pool).not.toContain('elephant');
      expect(pool.length).toBe(6); // 3 simple words from animals + 3 from food
    });

    it('should build word pool with advanced level', () => {
      const selectedIds = ['animals', 'food'];
      const pool = buildWordPool(mockCategories, selectedIds, 'advanced');

      expect(pool).toContain('elephant');
      expect(pool).toContain('caviar');
      expect(pool).not.toContain('cat');
      expect(pool.length).toBe(6); // 3 advanced words from animals + 3 from food
    });

    it('should build word pool with single category', () => {
      const selectedIds = ['sports'];
      const pool = buildWordPool(mockCategories, selectedIds, 'simple');

      expect(pool).toContain('run');
      expect(pool).toContain('jump');
      expect(pool).not.toContain('cat');
      expect(pool.length).toBe(3);
    });

    it('should return empty array for no selected categories', () => {
      const pool = buildWordPool(mockCategories, [], 'simple');

      expect(pool).toEqual([]);
    });

    it('should shuffle the word pool', () => {
      const selectedIds = ['animals'];
      const pool1 = buildWordPool(mockCategories, selectedIds, 'simple');
      const pool2 = buildWordPool(mockCategories, selectedIds, 'simple');

      // While we can't guarantee they're different (random chance they're same),
      // we can verify both contain the same words
      const pool1Set = new Set(pool1);
      const pool2Set = new Set(pool2);

      expect(pool1Set.size).toBe(3);
      expect(pool2Set.size).toBe(3);
    });
  });

  describe('getNextWord', () => {
    const availableWords = ['cat', 'dog', 'bird', 'fish', 'ant'];

    it('should return an unused word when available', () => {
      const usedWords = ['cat'];
      const skippedWords: string[] = [];

      const word = getNextWord(availableWords, usedWords, skippedWords);

      expect(word).not.toBe('cat');
      expect(availableWords).toContain(word);
    });

    it('should prefer unused words over skipped words', () => {
      const usedWords = ['cat', 'dog'];
      const skippedWords = ['bird'];

      const word = getNextWord(availableWords, usedWords, skippedWords);

      expect(word).not.toBe('cat');
      expect(word).not.toBe('dog');
      expect(['fish', 'ant']).toContain(word);
    });

    it('should return a skipped word if no unused words', () => {
      const usedWords = ['cat', 'dog', 'fish', 'ant'];
      const skippedWords = ['bird'];

      const word = getNextWord(availableWords, usedWords, skippedWords);

      expect(word).toBe('bird');
    });

    it('should return null if all words are exhausted', () => {
      const usedWords = ['cat', 'dog', 'bird', 'fish', 'ant'];
      const skippedWords: string[] = [];

      const word = getNextWord(availableWords, usedWords, skippedWords);

      expect(word).toBeNull();
    });

    it('should handle empty available words', () => {
      const word = getNextWord([], [], []);

      expect(word).toBeNull();
    });
  });

  describe('getTurnOrder', () => {
    const mockPlayers: Player[] = [
      { id: 'p1', name: 'Alice', score: 0 },
      { id: 'p2', name: 'Bob', score: 0 },
      { id: 'p3', name: 'Charlie', score: 0 },
    ];

    const mockTeams: Team[] = [
      { id: 't1', name: 'Team 1', playerIds: ['p1', 'p2'], score: 0 },
      { id: 't2', name: 'Team 2', playerIds: ['p3'], score: 0 },
    ];

    it('should return turn order for free-for-all mode', () => {
      const order = getTurnOrder('free-for-all', mockPlayers, []);

      expect(order).toHaveLength(3);
      expect(order[0].playerId).toBe('p1');
      expect(order[1].playerId).toBe('p2');
      expect(order[2].playerId).toBe('p3');
      expect(order[0].teamId).toBeUndefined();
    });

    it('should return turn order for teams mode', () => {
      const order = getTurnOrder('teams', mockPlayers, mockTeams);

      expect(order).toHaveLength(3);
      // First 2 players from team 1
      expect(order[0].teamId).toBe('t1');
      expect(order[1].teamId).toBe('t1');
      // Last player from team 2
      expect(order[2].teamId).toBe('t2');
    });

    it('should include all players in teams mode', () => {
      const order = getTurnOrder('teams', mockPlayers, mockTeams);

      const playerIds = order.map((entry) => entry.playerId);
      expect(playerIds).toContain('p1');
      expect(playerIds).toContain('p2');
      expect(playerIds).toContain('p3');
    });

    it('should handle empty teams', () => {
      const order = getTurnOrder('teams', mockPlayers, []);

      expect(order).toHaveLength(0);
    });

    it('should handle empty players in free-for-all', () => {
      const order = getTurnOrder('free-for-all', [], []);

      expect(order).toHaveLength(0);
    });
  });
});
