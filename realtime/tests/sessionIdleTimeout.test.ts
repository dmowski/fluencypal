import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createSessionIdleGuard,
  isUserActivityMessage,
} from '../src/ws/sessionIdleTimeout.js';

describe('sessionIdleTimeout', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('classifies user activity messages', () => {
    expect(isUserActivityMessage({ type: 'user.text', text: 'hi' })).toBe(true);
    expect(isUserActivityMessage({ type: 'session.ping' })).toBe(false);
    expect(isUserActivityMessage({ type: 'session.end' })).toBe(false);
  });

  it('fires onIdle after timeout with no further activity', () => {
    vi.useFakeTimers();
    const onIdle = vi.fn();

    const guard = createSessionIdleGuard({ timeoutMs: 5000, onIdle });
    guard.onUserActivity();

    vi.advanceTimersByTime(4999);
    expect(onIdle).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  it('resets timer when user activity continues', () => {
    vi.useFakeTimers();
    const onIdle = vi.fn();

    const guard = createSessionIdleGuard({ timeoutMs: 3000, onIdle });
    guard.onUserActivity();
    vi.advanceTimersByTime(2000);
    guard.onUserActivity();
    vi.advanceTimersByTime(2999);
    expect(onIdle).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  it('dispose cancels pending idle close', () => {
    vi.useFakeTimers();
    const onIdle = vi.fn();

    const guard = createSessionIdleGuard({ timeoutMs: 1000, onIdle });
    guard.onUserActivity();
    guard.dispose();
    vi.advanceTimersByTime(2000);
    expect(onIdle).not.toHaveBeenCalled();
  });
});
