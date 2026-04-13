import '@testing-library/jest-dom';
import { calculateTurnScore, calculatePlayerScore, calculateTeamScore } from './scoreCalculator';
import { TurnState } from '../types';

describe('Score Calculator', () => {
  describe('calculateTurnScore', () => {
    it('should calculate correct score with only correct answers', () => {
      const turn: TurnState = {
        playerId: 'player-1',
        teamId: 'team-1',
        currentWord: '',
        wordsShown: [],
        actions: [],
        correctCount: 5,
        skipCount: 0,
        score: 5,
        startTime: Date.now(),
        isActive: false,
      };

      expect(calculateTurnScore(turn)).toBe(5);
    });

    it('should calculate correct score with both correct and skip answers', () => {
      const turn: TurnState = {
        playerId: 'player-1',
        teamId: 'team-1',
        currentWord: '',
        wordsShown: [],
        actions: [],
        correctCount: 5,
        skipCount: 2,
        score: 3,
        startTime: Date.now(),
        isActive: false,
      };

      expect(calculateTurnScore(turn)).toBe(3);
    });

    it('should calculate negative score when skips exceed correct', () => {
      const turn: TurnState = {
        playerId: 'player-1',
        teamId: 'team-1',
        currentWord: '',
        wordsShown: [],
        actions: [],
        correctCount: 2,
        skipCount: 5,
        score: -3,
        startTime: Date.now(),
        isActive: false,
      };

      expect(calculateTurnScore(turn)).toBe(-3);
    });

    it('should handle zero score', () => {
      const turn: TurnState = {
        playerId: 'player-1',
        teamId: 'team-1',
        currentWord: '',
        wordsShown: [],
        actions: [],
        correctCount: 0,
        skipCount: 0,
        score: 0,
        startTime: Date.now(),
        isActive: false,
      };

      expect(calculateTurnScore(turn)).toBe(0);
    });
  });

  describe('calculatePlayerScore', () => {
    it('should sum scores from all turns for a specific player', () => {
      const turns: TurnState[] = [
        {
          playerId: 'player-1',
          teamId: 'team-1',
          currentWord: '',
          wordsShown: [],
          actions: [],
          correctCount: 3,
          skipCount: 1,
          score: 2,
          startTime: Date.now(),
          isActive: false,
        },
        {
          playerId: 'player-1',
          teamId: 'team-1',
          currentWord: '',
          wordsShown: [],
          actions: [],
          correctCount: 4,
          skipCount: 0,
          score: 4,
          startTime: Date.now(),
          isActive: false,
        },
        {
          playerId: 'player-2',
          teamId: 'team-1',
          currentWord: '',
          wordsShown: [],
          actions: [],
          correctCount: 2,
          skipCount: 2,
          score: 0,
          startTime: Date.now(),
          isActive: false,
        },
      ];

      expect(calculatePlayerScore('player-1', turns)).toBe(6);
    });

    it('should return 0 for player with no turns', () => {
      const turns: TurnState[] = [
        {
          playerId: 'player-1',
          currentWord: '',
          wordsShown: [],
          actions: [],
          correctCount: 3,
          skipCount: 1,
          score: 2,
          startTime: Date.now(),
          isActive: false,
        },
      ];

      expect(calculatePlayerScore('player-2', turns)).toBe(0);
    });

    it('should handle negative scores', () => {
      const turns: TurnState[] = [
        {
          playerId: 'player-1',
          currentWord: '',
          wordsShown: [],
          actions: [],
          correctCount: 1,
          skipCount: 3,
          score: -2,
          startTime: Date.now(),
          isActive: false,
        },
        {
          playerId: 'player-1',
          currentWord: '',
          wordsShown: [],
          actions: [],
          correctCount: 2,
          skipCount: 1,
          score: 1,
          startTime: Date.now(),
          isActive: false,
        },
      ];

      expect(calculatePlayerScore('player-1', turns)).toBe(-1);
    });
  });

  describe('calculateTeamScore', () => {
    it('should sum scores from all turns for a specific team', () => {
      const turns: TurnState[] = [
        {
          playerId: 'player-1',
          teamId: 'team-1',
          currentWord: '',
          wordsShown: [],
          actions: [],
          correctCount: 3,
          skipCount: 1,
          score: 2,
          startTime: Date.now(),
          isActive: false,
        },
        {
          playerId: 'player-2',
          teamId: 'team-1',
          currentWord: '',
          wordsShown: [],
          actions: [],
          correctCount: 4,
          skipCount: 0,
          score: 4,
          startTime: Date.now(),
          isActive: false,
        },
        {
          playerId: 'player-3',
          teamId: 'team-2',
          currentWord: '',
          wordsShown: [],
          actions: [],
          correctCount: 2,
          skipCount: 2,
          score: 0,
          startTime: Date.now(),
          isActive: false,
        },
      ];

      expect(calculateTeamScore('team-1', turns)).toBe(6);
      expect(calculateTeamScore('team-2', turns)).toBe(0);
    });

    it('should return 0 for team with no turns', () => {
      const turns: TurnState[] = [
        {
          playerId: 'player-1',
          teamId: 'team-1',
          currentWord: '',
          wordsShown: [],
          actions: [],
          correctCount: 3,
          skipCount: 1,
          score: 2,
          startTime: Date.now(),
          isActive: false,
        },
      ];

      expect(calculateTeamScore('team-2', turns)).toBe(0);
    });

    it('should handle teams with negative scores', () => {
      const turns: TurnState[] = [
        {
          playerId: 'player-1',
          teamId: 'team-1',
          currentWord: '',
          wordsShown: [],
          actions: [],
          correctCount: 1,
          skipCount: 3,
          score: -2,
          startTime: Date.now(),
          isActive: false,
        },
        {
          playerId: 'player-2',
          teamId: 'team-1',
          currentWord: '',
          wordsShown: [],
          actions: [],
          correctCount: 2,
          skipCount: 1,
          score: 1,
          startTime: Date.now(),
          isActive: false,
        },
      ];

      expect(calculateTeamScore('team-1', turns)).toBe(-1);
    });
  });
});
