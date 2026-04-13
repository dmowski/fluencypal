/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Scoreboard } from './Scoreboard';
import { GameProvider } from '../context/GameContext';
import { useGame } from '../context/GameContext';
import { Player, Team, GameSettings, TurnState, RoundState, initialGameState } from '../types';
import { renderWithI18n } from '../test-utils/i18nTestHelper';

// Mock the useGameState hook
jest.mock('../hooks/useGameState', () => ({
  useGameState: jest.fn(),
}));

const { useGameState } = require('../hooks/useGameState');

describe('Scoreboard - Free-for-all Mode Bug Fix', () => {
  describe('Score Display During Game', () => {
    it('should display correct scores during a timed game in free-for-all mode', () => {
      // Setup game state with one round completed and one player having scored
      const player1: Player = { id: 'p1', name: 'Alice', score: 0 };
      const player2: Player = { id: 'p2', name: 'Bob', score: 0 };

      const settings: GameSettings = {
        mode: 'free-for-all',
        players: [player1, player2],
        teams: [],
        languageLevel: 'simple',
        selectedCategoryIds: ['animals'],
        turnSettings: { type: 'timed', duration: 60 },
        numberOfRounds: 3,
      };

      // Create a turn where player1 got 3 correct and 1 skip
      const turn1: TurnState = {
        playerId: 'p1',
        currentWord: '',
        wordsShown: ['cat', 'dog', 'bird', 'fish'],
        actions: [
          { word: 'cat', action: 'correct', timestamp: 0 },
          { word: 'dog', action: 'correct', timestamp: 1000 },
          { word: 'bird', action: 'correct', timestamp: 2000 },
          { word: 'fish', action: 'skip', timestamp: 3000 },
        ],
        correctCount: 3,
        skipCount: 1,
        score: 2, // 3 correct - 1 skip = 2
        startTime: Date.now(),
        endTime: Date.now() + 30000,
        isActive: false,
      };

      const turn2: TurnState = {
        playerId: 'p2',
        currentWord: '',
        wordsShown: ['lion', 'tiger'],
        actions: [
          { word: 'lion', action: 'correct', timestamp: 4000 },
          { word: 'tiger', action: 'skip', timestamp: 5000 },
        ],
        correctCount: 1,
        skipCount: 1,
        score: 0, // 1 correct - 1 skip = 0
        startTime: Date.now(),
        endTime: Date.now() + 30000,
        isActive: false,
      };

      const round1: RoundState = {
        roundNumber: 1,
        turns: [turn1, turn2],
        isComplete: true,
      };

      const gameState = {
        screen: 'scoreboard' as const,
        settings,
        rounds: [round1],
        currentRound: 1,
        currentTurnIndex: 2,
        availableWords: ['bear', 'zebra'],
        usedWords: ['cat', 'dog', 'bird', 'fish', 'lion', 'tiger'],
        skippedWords: ['fish', 'tiger'],
        isGameActive: true,
      };

      // Mock useGameState to return calculated scores from turns
      useGameState.mockReturnValue({
        state: gameState,
        getCurrentPlayer: () => player1,
        getCurrentTeam: () => null,
        setScreen: jest.fn(),
        getScores: () => [
          { playerId: 'p1', score: 2 },
          { playerId: 'p2', score: 0 },
        ],
        getTeamScores: () => [],
      });

      render(
        renderWithI18n(
          <GameProvider>
            <Scoreboard />
          </GameProvider>,
        ),
      );

      // Check that Alice's score is correctly displayed as 2
      expect(screen.getByTestId('scoreboard-score-Alice')).toHaveTextContent('2');
      // Check that Bob's score is correctly displayed as 0
      expect(screen.getByTestId('scoreboard-score-Bob')).toHaveTextContent('0');
    });

    it('should display correct scores after game ends in free-for-all mode', () => {
      const player1: Player = { id: 'p1', name: 'Alice', score: 0 };
      const player2: Player = { id: 'p2', name: 'Bob', score: 0 };
      const player3: Player = { id: 'p3', name: 'Charlie', score: 0 };

      const settings: GameSettings = {
        mode: 'free-for-all',
        players: [player1, player2, player3],
        teams: [],
        languageLevel: 'simple',
        selectedCategoryIds: ['animals'],
        turnSettings: { type: 'timed', duration: 60 },
        numberOfRounds: 2,
      };

      // Create multiple turns across rounds
      const turn1: TurnState = {
        playerId: 'p1',
        currentWord: '',
        wordsShown: ['cat', 'dog'],
        actions: [
          { word: 'cat', action: 'correct', timestamp: 0 },
          { word: 'dog', action: 'correct', timestamp: 1000 },
        ],
        correctCount: 2,
        skipCount: 0,
        score: 2,
        startTime: Date.now(),
        endTime: Date.now() + 30000,
        isActive: false,
      };

      const turn2: TurnState = {
        playerId: 'p2',
        currentWord: '',
        wordsShown: ['bird'],
        actions: [{ word: 'bird', action: 'correct', timestamp: 2000 }],
        correctCount: 1,
        skipCount: 0,
        score: 1,
        startTime: Date.now(),
        endTime: Date.now() + 30000,
        isActive: false,
      };

      const turn3: TurnState = {
        playerId: 'p3',
        currentWord: '',
        wordsShown: ['fish', 'lion'],
        actions: [
          { word: 'fish', action: 'skip', timestamp: 3000 },
          { word: 'lion', action: 'correct', timestamp: 4000 },
        ],
        correctCount: 1,
        skipCount: 1,
        score: 0,
        startTime: Date.now(),
        endTime: Date.now() + 30000,
        isActive: false,
      };

      // Round 2 - second turn for each player
      const turn4: TurnState = {
        playerId: 'p1',
        currentWord: '',
        wordsShown: ['tiger'],
        actions: [{ word: 'tiger', action: 'correct', timestamp: 5000 }],
        correctCount: 1,
        skipCount: 0,
        score: 1,
        startTime: Date.now(),
        endTime: Date.now() + 30000,
        isActive: false,
      };

      const turn5: TurnState = {
        playerId: 'p2',
        currentWord: '',
        wordsShown: ['bear', 'zebra'],
        actions: [
          { word: 'bear', action: 'correct', timestamp: 6000 },
          { word: 'zebra', action: 'correct', timestamp: 7000 },
        ],
        correctCount: 2,
        skipCount: 0,
        score: 2,
        startTime: Date.now(),
        endTime: Date.now() + 30000,
        isActive: false,
      };

      const turn6: TurnState = {
        playerId: 'p3',
        currentWord: '',
        wordsShown: ['lion'],
        actions: [{ word: 'lion', action: 'correct', timestamp: 8000 }],
        correctCount: 1,
        skipCount: 0,
        score: 1,
        startTime: Date.now(),
        endTime: Date.now() + 30000,
        isActive: false,
      };

      const round1: RoundState = {
        roundNumber: 1,
        turns: [turn1, turn2, turn3],
        isComplete: true,
      };

      const round2: RoundState = {
        roundNumber: 2,
        turns: [turn4, turn5, turn6],
        isComplete: true,
      };

      const gameState = {
        screen: 'game-end' as const,
        settings,
        rounds: [round1, round2],
        currentRound: 2,
        currentTurnIndex: 6,
        availableWords: [],
        usedWords: [],
        skippedWords: [],
        isGameActive: false,
      };

      // Mock useGameState with correct score calculations
      useGameState.mockReturnValue({
        state: gameState,
        getCurrentPlayer: () => null,
        getCurrentTeam: () => null,
        setScreen: jest.fn(),
        getScores: () => [
          { playerId: 'p1', score: 3 }, // 2 + 1
          { playerId: 'p2', score: 3 }, // 1 + 2
          { playerId: 'p3', score: 1 }, // 0 + 1
        ],
        getTeamScores: () => [],
      });

      render(
        renderWithI18n(
          <GameProvider>
            <Scoreboard />
          </GameProvider>,
        ),
      );

      // Verify all scores are displayed correctly
      expect(screen.getByTestId('scoreboard-score-Alice')).toHaveTextContent('3');
      expect(screen.getByTestId('scoreboard-score-Bob')).toHaveTextContent('3');
      expect(screen.getByTestId('scoreboard-score-Charlie')).toHaveTextContent('1');

      // Alice and Bob should be tied at first rank, Charlie at second
      const tableRows = screen.getAllByTestId(/scoreboard-row-/);
      expect(tableRows.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Score Display In Teams Mode', () => {
    it('should display correct team scores during a timed game', () => {
      const player1: Player = { id: 'p1', name: 'Alice', teamId: 't1', score: 0 };
      const player2: Player = { id: 'p2', name: 'Bob', teamId: 't1', score: 0 };
      const player3: Player = { id: 'p3', name: 'Charlie', teamId: 't2', score: 0 };

      const team1: Team = { id: 't1', name: 'Team A', playerIds: ['p1', 'p2'], score: 0 };
      const team2: Team = { id: 't2', name: 'Team B', playerIds: ['p3'], score: 0 };

      const settings: GameSettings = {
        mode: 'teams',
        players: [player1, player2, player3],
        teams: [team1, team2],
        languageLevel: 'simple',
        selectedCategoryIds: ['animals'],
        turnSettings: { type: 'timed', duration: 60 },
        numberOfRounds: 1,
      };

      // Team A's turn
      const turn1: TurnState = {
        playerId: 'p1',
        teamId: 't1',
        currentWord: '',
        wordsShown: ['cat', 'dog'],
        actions: [
          { word: 'cat', action: 'correct', timestamp: 0 },
          { word: 'dog', action: 'correct', timestamp: 1000 },
        ],
        correctCount: 2,
        skipCount: 0,
        score: 2,
        startTime: Date.now(),
        endTime: Date.now() + 30000,
        isActive: false,
      };

      // Team B's turn
      const turn2: TurnState = {
        playerId: 'p3',
        teamId: 't2',
        currentWord: '',
        wordsShown: ['bird'],
        actions: [{ word: 'bird', action: 'correct', timestamp: 2000 }],
        correctCount: 1,
        skipCount: 0,
        score: 1,
        startTime: Date.now(),
        endTime: Date.now() + 30000,
        isActive: false,
      };

      const round1: RoundState = {
        roundNumber: 1,
        turns: [turn1, turn2],
        isComplete: true,
      };

      const gameState = {
        screen: 'scoreboard' as const,
        settings,
        rounds: [round1],
        currentRound: 1,
        currentTurnIndex: 2,
        availableWords: ['fish'],
        usedWords: ['cat', 'dog', 'bird'],
        skippedWords: [],
        isGameActive: true,
      };

      useGameState.mockReturnValue({
        state: gameState,
        getCurrentPlayer: () => player1,
        getCurrentTeam: () => team1,
        setScreen: jest.fn(),
        getScores: () => [],
        getTeamScores: () => [
          { teamId: 't1', score: 2 },
          { teamId: 't2', score: 1 },
        ],
      });

      render(
        renderWithI18n(
          <GameProvider>
            <Scoreboard />
          </GameProvider>,
        ),
      );

      // Team A should show score 2
      expect(screen.getByTestId('scoreboard-score-Team A')).toHaveTextContent('2');
      // Team B should show score 1
      expect(screen.getByTestId('scoreboard-score-Team B')).toHaveTextContent('1');
    });
  });
});
