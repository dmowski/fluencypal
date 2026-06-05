import { describe, expect, it } from 'vitest';
import { calculateStagePriceUsd, formatUsd } from '../client/src/lib/sessionPricing.js';

describe('sessionPricing', () => {
  it('calculates LLM token price', () => {
    const price = calculateStagePriceUsd('llm', 'gpt-4o-mini', {
      input_tokens: 1000,
      output_tokens: 500,
    });
    expect(price).toBeCloseTo(0.00045, 6);
  });

  it('calculates STT price from audio duration', () => {
    const price = calculateStagePriceUsd('stt', 'gpt-4o-mini-transcribe', {
      input_tokens: 0,
      output_tokens: 0,
      audioDurationSeconds: 60,
    });
    expect(price).toBeCloseTo(0.003, 6);
  });

  it('calculates TTS price from audio duration', () => {
    const price = calculateStagePriceUsd('tts', 'gpt-4o-mini-tts', {
      input_tokens: 0,
      output_tokens: 0,
      audioDurationSeconds: 60,
    });
    expect(price).toBeCloseTo(0.015, 6);
  });

  it('formats USD with four decimals', () => {
    expect(formatUsd(0.0123456)).toBe('$0.0123');
  });
});
