/** @jest-environment jsdom */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { GameProvider } from './GameContext';
import { useGame } from './GameContext';

describe('GameContext - Round Logic', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <GameProvider>{children}</GameProvider>
  );

  describe('INCREMENT_ROUND action', () => {
    it('should increment currentRound by 1', () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      // Initial round is 0
      expect(result.current.state.currentRound).toBe(0);

      act(() => {
        result.current.dispatch({ type: 'INCREMENT_ROUND' });
      });

      expect(result.current.state.currentRound).toBe(1);
    });

    it('should increment currentRound multiple times', () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      act(() => {
        result.current.dispatch({ type: 'INCREMENT_ROUND' });
        result.current.dispatch({ type: 'INCREMENT_ROUND' });
        result.current.dispatch({ type: 'INCREMENT_ROUND' });
      });

      expect(result.current.state.currentRound).toBe(3);
    });
  });

  describe('START_GAME action', () => {
    it('should initialize currentRound to 1', () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: 'START_GAME',
          payload: { words: ['word1', 'word2', 'word3'] },
        });
      });

      expect(result.current.state.currentRound).toBe(1);
    });

    it('should start with one empty round', () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: 'START_GAME',
          payload: { words: ['word1', 'word2', 'word3'] },
        });
        result.current.dispatch({ type: 'START_ROUND' });
      });

      expect(result.current.state.rounds.length).toBe(1);
      expect(result.current.state.rounds[0].roundNumber).toBe(1);
      expect(result.current.state.rounds[0].turns.length).toBe(0);
    });
  });

  describe('START_ROUND action', () => {
    it('should create a new round with incremented roundNumber', () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: 'START_GAME',
          payload: { words: ['word1', 'word2'] },
        });
        result.current.dispatch({ type: 'START_ROUND' });
      });

      expect(result.current.state.rounds.length).toBe(1);
      expect(result.current.state.rounds[0].roundNumber).toBe(1);

      act(() => {
        result.current.dispatch({ type: 'INCREMENT_ROUND' });
        result.current.dispatch({ type: 'START_ROUND' });
      });

      expect(result.current.state.rounds.length).toBe(2);
      expect(result.current.state.rounds[1].roundNumber).toBe(2);
    });

    it('should reset used and skipped words', () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: 'START_GAME',
          payload: { words: ['word1', 'word2'] },
        });
        result.current.dispatch({ type: 'START_ROUND' });
      });

      // Start a turn first
      act(() => {
        result.current.dispatch({
          type: 'START_TURN',
          payload: {
            playerId: 'p1',
            currentWord: 'word1',
            wordsShown: [],
            actions: [],
            correctCount: 0,
            skipCount: 0,
            score: 0,
            startTime: Date.now(),
            isActive: true,
          },
        });
      });

      // Simulate used words
      act(() => {
        result.current.dispatch({
          type: 'RECORD_ACTION',
          payload: { word: 'word1', action: 'correct', timestamp: Date.now() },
        });
      });

      expect(result.current.state.usedWords.length).toBeGreaterThan(0);

      act(() => {
        result.current.dispatch({ type: 'INCREMENT_ROUND' });
        result.current.dispatch({ type: 'START_ROUND' });
      });

      expect(result.current.state.usedWords.length).toBe(0);
      expect(result.current.state.skippedWords.length).toBe(0);
    });
  });

  describe('Round progression', () => {
    it('should track multiple rounds correctly', () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: 'START_GAME',
          payload: { words: ['word1', 'word2', 'word3', 'word4', 'word5'] },
        });
      });

      // Round 1
      expect(result.current.state.currentRound).toBe(1);
      act(() => {
        result.current.dispatch({ type: 'START_ROUND' });
      });
      expect(result.current.state.rounds[0].roundNumber).toBe(1);

      // Move to round 2
      act(() => {
        result.current.dispatch({ type: 'INCREMENT_ROUND' });
        result.current.dispatch({ type: 'START_ROUND' });
      });
      expect(result.current.state.currentRound).toBe(2);
      expect(result.current.state.rounds[1].roundNumber).toBe(2);

      // Move to round 3
      act(() => {
        result.current.dispatch({ type: 'INCREMENT_ROUND' });
        result.current.dispatch({ type: 'START_ROUND' });
      });
      expect(result.current.state.currentRound).toBe(3);
      expect(result.current.state.rounds[2].roundNumber).toBe(3);
    });
  });
});
