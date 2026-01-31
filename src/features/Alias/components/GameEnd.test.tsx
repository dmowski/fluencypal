/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { GameEnd } from './GameEnd';
import { GameProvider } from '../context/GameContext';
import { Player, Team, GameSettings, TurnState, RoundState } from '../types';

// Mock the useGameState hook
jest.mock('../hooks/useGameState', () => ({
  useGameState: jest.fn(),
}));

const { useGameState } = require('../hooks/useGameState');

describe('GameEnd - Final Standings Bug Fix', () => {
  describe('Final Score Display', () => {
    it('should display correct final scores in free-for-all mode', () => {
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

      // Create turns for round 1
      const turn1: TurnState = {
        playerId: 'p1',
        currentWord: '',
        wordsShown: ['cat', 'dog', 'bird'],
        actions: [
          { word: 'cat', action: 'correct', timestamp: 0 },
          { word: 'dog', action: 'correct', timestamp: 1000 },
          { word: 'bird', action: 'skip', timestamp: 2000 },
        ],
        correctCount: 2,
        skipCount: 1,
        score: 1, // 2 - 1 = 1
        startTime: Date.now(),
        endTime: Date.now() + 30000,
        isActive: false,
      };

      const turn2: TurnState = {
        playerId: 'p2',
        currentWord: '',
        wordsShown: ['fish', 'lion', 'tiger'],
        actions: [
          { word: 'fish', action: 'correct', timestamp: 3000 },
          { word: 'lion', action: 'correct', timestamp: 4000 },
          { word: 'tiger', action: 'correct', timestamp: 5000 },
        ],
        correctCount: 3,
        skipCount: 0,
        score: 3,
        startTime: Date.now(),
        endTime: Date.now() + 30000,
        isActive: false,
      };

      const turn3: TurnState = {
        playerId: 'p3',
        currentWord: '',
        wordsShown: ['bear'],
        actions: [{ word: 'bear', action: 'skip', timestamp: 6000 }],
        correctCount: 0,
        skipCount: 1,
        score: -1,
        startTime: Date.now(),
        endTime: Date.now() + 30000,
        isActive: false,
      };

      // Round 2 turns
      const turn4: TurnState = {
        playerId: 'p1',
        currentWord: '',
        wordsShown: ['zebra'],
        actions: [{ word: 'zebra', action: 'correct', timestamp: 7000 }],
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
        wordsShown: ['elephant', 'giraffe'],
        actions: [
          { word: 'elephant', action: 'correct', timestamp: 8000 },
          { word: 'giraffe', action: 'skip', timestamp: 9000 },
        ],
        correctCount: 1,
        skipCount: 1,
        score: 0,
        startTime: Date.now(),
        endTime: Date.now() + 30000,
        isActive: false,
      };

      const turn6: TurnState = {
        playerId: 'p3',
        currentWord: '',
        wordsShown: ['monkey', 'penguin'],
        actions: [
          { word: 'monkey', action: 'correct', timestamp: 10000 },
          { word: 'penguin', action: 'correct', timestamp: 11000 },
        ],
        correctCount: 2,
        skipCount: 0,
        score: 2,
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

      // Mock useGameState with correct final scores
      (useGameState as jest.Mock).mockReturnValue({
        state: gameState,
        setScreen: jest.fn(),
        initializeGame: jest.fn(),
        getScores: () => [
          { playerId: 'p1', score: 2 }, // 1 + 1
          { playerId: 'p2', score: 3 }, // 3 + 0
          { playerId: 'p3', score: 1 }, // -1 + 2
        ],
        getTeamScores: () => [],
      });

      render(
        <GameProvider>
          <GameEnd />
        </GameProvider>,
      );

      // Check winner
      expect(screen.getByTestId('winner-name')).toHaveTextContent('Bob wins!');
      expect(screen.getByTestId('winner-score')).toHaveTextContent('Final Score: 3');

      // Check final standings
      expect(screen.getByTestId('final-score-Bob')).toBeInTheDocument();
      const cells = screen.getAllByRole('cell');

      // Find the score cells in the standings table
      expect(screen.getByTestId('final-score-Bob')).toBeInTheDocument();
      expect(screen.getByTestId('final-score-Alice')).toBeInTheDocument();
      expect(screen.getByTestId('final-score-Charlie')).toBeInTheDocument();
    });

    it('should display correct final team scores', () => {
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
        wordsShown: ['cat', 'dog', 'bird'],
        actions: [
          { word: 'cat', action: 'correct', timestamp: 0 },
          { word: 'dog', action: 'correct', timestamp: 1000 },
          { word: 'bird', action: 'correct', timestamp: 2000 },
        ],
        correctCount: 3,
        skipCount: 0,
        score: 3,
        startTime: Date.now(),
        endTime: Date.now() + 30000,
        isActive: false,
      };

      // Team B's turn
      const turn2: TurnState = {
        playerId: 'p3',
        teamId: 't2',
        currentWord: '',
        wordsShown: ['fish', 'lion'],
        actions: [
          { word: 'fish', action: 'correct', timestamp: 3000 },
          { word: 'lion', action: 'skip', timestamp: 4000 },
        ],
        correctCount: 1,
        skipCount: 1,
        score: 0,
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
        screen: 'game-end' as const,
        settings,
        rounds: [round1],
        currentRound: 1,
        currentTurnIndex: 2,
        availableWords: [],
        usedWords: [],
        skippedWords: [],
        isGameActive: false,
      };

      (useGameState as jest.Mock).mockReturnValue({
        state: gameState,
        setScreen: jest.fn(),
        initializeGame: jest.fn(),
        getScores: () => [],
        getTeamScores: () => [
          { teamId: 't1', score: 3 },
          { teamId: 't2', score: 0 },
        ],
      });

      render(
        <GameProvider>
          <GameEnd />
        </GameProvider>,
      );

      // Check winner
      expect(screen.getByTestId('winner-name')).toHaveTextContent('Team A wins!');
      expect(screen.getByTestId('winner-score')).toHaveTextContent('Final Score: 3');

      // Check final standings
      expect(screen.getByTestId('final-score-Team A')).toBeInTheDocument();
      expect(screen.getByTestId('final-score-Team B')).toBeInTheDocument();
    });

    it('should display statistics correctly', () => {
      const player1: Player = { id: 'p1', name: 'Alice', score: 0 };
      const player2: Player = { id: 'p2', name: 'Bob', score: 0 };

      const settings: GameSettings = {
        mode: 'free-for-all',
        players: [player1, player2],
        teams: [],
        languageLevel: 'simple',
        selectedCategoryIds: ['animals'],
        turnSettings: { type: 'timed', duration: 60 },
        numberOfRounds: 1,
      };

      const turn1: TurnState = {
        playerId: 'p1',
        currentWord: '',
        wordsShown: ['cat', 'dog', 'bird', 'fish'],
        actions: [
          { word: 'cat', action: 'correct', timestamp: 0 },
          { word: 'dog', action: 'correct', timestamp: 1000 },
          { word: 'bird', action: 'skip', timestamp: 2000 },
          { word: 'fish', action: 'correct', timestamp: 3000 },
        ],
        correctCount: 3,
        skipCount: 1,
        score: 2,
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
          { word: 'tiger', action: 'correct', timestamp: 5000 },
        ],
        correctCount: 2,
        skipCount: 0,
        score: 2,
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
        screen: 'game-end' as const,
        settings,
        rounds: [round1],
        currentRound: 1,
        currentTurnIndex: 2,
        availableWords: [],
        usedWords: [],
        skippedWords: [],
        isGameActive: false,
      };

      (useGameState as jest.Mock).mockReturnValue({
        state: gameState,
        setScreen: jest.fn(),
        initializeGame: jest.fn(),
        getScores: () => [
          { playerId: 'p1', score: 2 },
          { playerId: 'p2', score: 2 },
        ],
        getTeamScores: () => [],
      });

      render(
        <GameProvider>
          <GameEnd />
        </GameProvider>,
      );

      // Total Turns: 2
      expect(screen.getByTestId('stat-turns')).toHaveTextContent('2');
      // Words Attempted: 4 + 2 = 6 (3 correct + 1 skip + 2 correct)
      expect(screen.getByTestId('stat-words')).toHaveTextContent('6');
      // Accuracy: 5/6 ≈ 83%
      expect(screen.getByTestId('stat-accuracy')).toHaveTextContent('83%');
    });
  });
});
