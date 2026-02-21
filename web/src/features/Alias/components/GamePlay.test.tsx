/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen, waitFor, act } from '@testing-library/react';
import { GamePlay } from './GamePlay';
import { renderWithI18n } from '../test-utils/i18nTestHelper';

// Mock the useGameState hook
jest.mock('../hooks/useGameState', () => ({
  useGameState: jest.fn(),
}));

import { useGameState } from '../hooks/useGameState';

describe('GamePlay - Timer Behavior', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('should countdown from 60 seconds without freezing or resetting', async () => {
    const mockEndTurn = jest.fn();
    const mockSetCurrentWord = jest.fn();
    const mockGetNextWord = jest.fn(() => 'test-word');

    const startTime = Date.now();

    (useGameState as jest.Mock).mockReturnValue({
      state: {
        settings: {
          turnSettings: {
            type: 'timed',
            duration: 60,
          },
        },
      },
      getCurrentPlayer: () => ({ id: '1', name: 'Player 1', score: 0 }),
      getCurrentTeam: () => null,
      getCurrentTurn: () => ({
        playerId: '1',
        currentWord: 'test-word',
        wordsShown: [],
        actions: [],
        correctCount: 0,
        skipCount: 0,
        score: 0,
        startTime,
        isActive: true,
      }),
      getNextWord: mockGetNextWord,
      setCurrentWord: mockSetCurrentWord,
      recordCorrect: jest.fn(),
      recordSkip: jest.fn(),
      endTurn: mockEndTurn,
    });

    render(renderWithI18n(<GamePlay />));

    // Initial state - should show 60 seconds
    expect(screen.getByTestId('timer')).toHaveTextContent('60s');

    // Advance time by 2 seconds to reach 58
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.getByTestId('timer')).toHaveTextContent('58s');
    });

    // Advance time by another 2 seconds
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.getByTestId('timer')).toHaveTextContent('56s');
    });

    // Verify timer continues to countdown and doesn't freeze at 60
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      const timerText = screen.getByTestId('timer').textContent;
      expect(timerText).not.toContain('60s');
      expect(timerText).toContain('53s');
    });
  });

  it('should not reset timer when word changes', async () => {
    const mockEndTurn = jest.fn();
    const mockSetCurrentWord = jest.fn();
    const mockGetNextWord = jest.fn(() => 'new-word');
    const mockRecordCorrect = jest.fn();

    const startTime = Date.now();
    let currentWord = 'first-word';

    (useGameState as jest.Mock).mockImplementation(() => ({
      state: {
        settings: {
          turnSettings: {
            type: 'timed',
            duration: 60,
          },
        },
      },
      getCurrentPlayer: () => ({ id: '1', name: 'Player 1', score: 0 }),
      getCurrentTeam: () => null,
      getCurrentTurn: () => ({
        playerId: '1',
        currentWord,
        wordsShown: [currentWord],
        actions: [],
        correctCount: 0,
        skipCount: 0,
        score: 0,
        startTime,
        isActive: true,
      }),
      getNextWord: mockGetNextWord,
      setCurrentWord: mockSetCurrentWord,
      recordCorrect: mockRecordCorrect,
      recordSkip: jest.fn(),
      endTurn: mockEndTurn,
    }));

    const { rerender } = render(renderWithI18n(<GamePlay />));

    // Wait for timer to countdown
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(screen.getByTestId('timer')).toHaveTextContent('55s');
    });

    // Simulate word change (this often triggers re-renders)
    currentWord = 'second-word';
    rerender(renderWithI18n(<GamePlay />));

    // Timer should NOT reset to 60
    await waitFor(() => {
      const timerText = screen.getByTestId('timer').textContent;
      expect(timerText).not.toContain('60s');
      expect(timerText).toContain('55s');
    });

    // Continue countdown
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.getByTestId('timer')).toHaveTextContent('53s');
    });
  });

  it('should maintain consistent countdown without jumping', async () => {
    const mockEndTurn = jest.fn();
    const startTime = Date.now();

    (useGameState as jest.Mock).mockReturnValue({
      state: {
        settings: {
          turnSettings: {
            type: 'timed',
            duration: 60,
          },
        },
      },
      getCurrentPlayer: () => ({ id: '1', name: 'Player 1', score: 0 }),
      getCurrentTeam: () => null,
      getCurrentTurn: () => ({
        playerId: '1',
        currentWord: 'test-word',
        wordsShown: [],
        actions: [],
        correctCount: 0,
        skipCount: 0,
        score: 0,
        startTime,
        isActive: true,
      }),
      getNextWord: () => 'test-word',
      setCurrentWord: jest.fn(),
      recordCorrect: jest.fn(),
      recordSkip: jest.fn(),
      endTurn: mockEndTurn,
    });

    render(renderWithI18n(<GamePlay />));

    const timerValues: string[] = [];

    // Collect timer values over 10 seconds
    for (let i = 0; i < 20; i++) {
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        const timerElement = screen.getByTestId('timer');
        if (timerElement.textContent) {
          timerValues.push(timerElement.textContent);
        }
      });
    }

    // Verify countdown is monotonically decreasing (no jumps back to 60)
    const seconds = timerValues
      .map((t) => {
        const match = t.match(/(\d+)s/);
        return match ? parseInt(match[1], 10) : NaN;
      })
      .filter((s) => !isNaN(s));

    // Should have captured meaningful timer values
    expect(seconds.length).toBeGreaterThan(5);

    for (let i = 1; i < seconds.length; i++) {
      // Each value should be less than or equal to the previous
      // (equal is ok due to 500ms interval, but never greater)
      expect(seconds[i]).toBeLessThanOrEqual(seconds[i - 1]);

      // Should never jump back to 60
      if (i > 5) {
        expect(seconds[i]).not.toBe(60);
      }
    }
  });

  it('should not reset timer when endTurn function reference changes', async () => {
    const startTime = Date.now();
    let endTurnFunc = jest.fn();

    (useGameState as jest.Mock).mockImplementation(() => ({
      state: {
        settings: {
          turnSettings: {
            type: 'timed',
            duration: 60,
          },
        },
      },
      getCurrentPlayer: () => ({ id: '1', name: 'Player 1', score: 0 }),
      getCurrentTeam: () => null,
      getCurrentTurn: () => ({
        playerId: '1',
        currentWord: 'test-word',
        wordsShown: [],
        actions: [],
        correctCount: 0,
        skipCount: 0,
        score: 0,
        startTime,
        isActive: true,
      }),
      getNextWord: () => 'test-word',
      setCurrentWord: jest.fn(),
      recordCorrect: jest.fn(),
      recordSkip: jest.fn(),
      endTurn: endTurnFunc,
    }));

    const { rerender } = render(renderWithI18n(<GamePlay />));

    // Let timer countdown
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(screen.getByTestId('timer')).toHaveTextContent('55s');
    });

    // Simulate endTurn function reference change (new mock instance)
    endTurnFunc = jest.fn();
    (useGameState as jest.Mock).mockImplementation(() => ({
      state: {
        settings: {
          turnSettings: {
            type: 'timed',
            duration: 60,
          },
        },
      },
      getCurrentPlayer: () => ({ id: '1', name: 'Player 1', score: 0 }),
      getCurrentTeam: () => null,
      getCurrentTurn: () => ({
        playerId: '1',
        currentWord: 'test-word',
        wordsShown: [],
        actions: [],
        correctCount: 0,
        skipCount: 0,
        score: 0,
        startTime,
        isActive: true,
      }),
      getNextWord: () => 'test-word',
      setCurrentWord: jest.fn(),
      recordCorrect: jest.fn(),
      recordSkip: jest.fn(),
      endTurn: endTurnFunc, // NEW FUNCTION REFERENCE
    }));

    // Force re-render
    rerender(renderWithI18n(<GamePlay />));

    // Timer should NOT reset to 60 when endTurn reference changes
    await waitFor(() => {
      const timerText = screen.getByTestId('timer').textContent;
      expect(timerText).not.toContain('60s');
      // Should still be around 55s, not reset
      expect(timerText).toContain('55s');
    });
  });
});
