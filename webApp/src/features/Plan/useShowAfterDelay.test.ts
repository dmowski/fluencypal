/**
 * @jest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react';
import { useShowAfterDelay } from './useShowAfterDelay';

describe('useShowAfterDelay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('stays hidden until the delay elapses while active', () => {
    const { result, rerender } = renderHook(({ active }) => useShowAfterDelay(active, 10_000), {
      initialProps: { active: true },
    });

    expect(result.current).toBe(false);

    act(() => {
      jest.advanceTimersByTime(9_999);
    });
    expect(result.current).toBe(false);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe(true);

    rerender({ active: false });
    expect(result.current).toBe(false);
  });

  it('does not show if loading stops before the delay', () => {
    const { result, rerender } = renderHook(({ active }) => useShowAfterDelay(active, 10_000), {
      initialProps: { active: true },
    });

    act(() => {
      jest.advanceTimersByTime(5_000);
    });
    rerender({ active: false });

    act(() => {
      jest.advanceTimersByTime(10_000);
    });
    expect(result.current).toBe(false);
  });
});
