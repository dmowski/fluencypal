import { describe, expect, it, vi } from 'vitest';
import {
  RealtimeTurnDetector,
  computePcm16Rms,
  defaultTurnDetectorConfig,
  hasMeaningfulBufferedSpeech,
} from '../src/session/turnDetection.js';

const makePcmChunk = (amplitude: number, sampleCount = 480): Buffer => {
  const buffer = Buffer.alloc(sampleCount * 2);
  for (let i = 0; i < sampleCount; i++) {
    buffer.writeInt16LE(amplitude, i * 2);
  }
  return buffer;
};

describe('turnDetection', () => {
  it('computes RMS for pcm16', () => {
    expect(computePcm16Rms(makePcmChunk(0))).toBe(0);
    expect(computePcm16Rms(makePcmChunk(3000))).toBeGreaterThan(defaultTurnDetectorConfig.rmsThreshold);
  });

  it('ignores a trailing odd byte instead of throwing', () => {
    const oddLength = Buffer.alloc(255);
    oddLength.writeInt16LE(3000, 0);

    expect(() => computePcm16Rms(oddLength)).not.toThrow();
    expect(computePcm16Rms(oddLength)).toBeGreaterThan(0);
  });

  it('fires turn end after speech followed by silence', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const onTurnEnd = vi.fn();
    const detector = new RealtimeTurnDetector({
      ...defaultTurnDetectorConfig,
      silenceMs: 500,
      minSpeechMs: 100,
    });

    detector.processChunk(makePcmChunk(4000), {
      onSpeechStart: vi.fn(),
      onSpeechEnd: vi.fn(),
      onTurnEnd,
    });

    await vi.advanceTimersByTimeAsync(150);

    detector.processChunk(makePcmChunk(4000), {
      onSpeechStart: vi.fn(),
      onSpeechEnd: vi.fn(),
      onTurnEnd,
    });

    detector.processChunk(makePcmChunk(0), {
      onSpeechStart: vi.fn(),
      onSpeechEnd: vi.fn(),
      onTurnEnd,
    });

    await vi.advanceTimersByTimeAsync(500);
    expect(onTurnEnd).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('fires turn end when silent mic chunks keep streaming after speech', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const onTurnEnd = vi.fn();
    const detector = new RealtimeTurnDetector({
      ...defaultTurnDetectorConfig,
      silenceMs: 500,
      minSpeechMs: 100,
    });

    detector.processChunk(makePcmChunk(4000), {
      onSpeechStart: vi.fn(),
      onSpeechEnd: vi.fn(),
      onTurnEnd,
    });

    await vi.advanceTimersByTimeAsync(200);

    detector.processChunk(makePcmChunk(4000), {
      onSpeechStart: vi.fn(),
      onSpeechEnd: vi.fn(),
      onTurnEnd,
    });

    for (let i = 0; i < 10; i++) {
      detector.processChunk(makePcmChunk(0), {
        onSpeechStart: vi.fn(),
        onSpeechEnd: vi.fn(),
        onTurnEnd,
      });
      await vi.advanceTimersByTimeAsync(170);
    }

    expect(onTurnEnd).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('does not fire turn end for short noise bursts', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const onTurnEnd = vi.fn();
    const detector = new RealtimeTurnDetector({
      ...defaultTurnDetectorConfig,
      silenceMs: 200,
      minSpeechMs: 1000,
    });

    detector.processChunk(makePcmChunk(5000), {
      onSpeechStart: vi.fn(),
      onSpeechEnd: vi.fn(),
      onTurnEnd,
    });

    await vi.advanceTimersByTimeAsync(200);
    expect(onTurnEnd).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('rejects buffered audio that is too short or too quiet for STT', () => {
    expect(hasMeaningfulBufferedSpeech([makePcmChunk(0, 100)])).toBe(false);
    expect(hasMeaningfulBufferedSpeech([makePcmChunk(5000, 100)])).toBe(false);
    expect(hasMeaningfulBufferedSpeech([makePcmChunk(5000, 12_000)])).toBe(true);
  });
});
