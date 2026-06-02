import { describe, expect, it } from 'vitest';
import { pcm16ToWav } from '../src/providers/pcm16ToWav.js';
import { AUDIO_SAMPLE_RATE_HZ } from '../src/protocol/audioCodec.js';

describe('providers/pcm16ToWav', () => {
  it('wraps pcm16 in a wav header', () => {
    const pcm = Buffer.alloc(4);
    const wav = pcm16ToWav(pcm);

    expect(wav.subarray(0, 4).toString()).toBe('RIFF');
    expect(wav.subarray(8, 12).toString()).toBe('WAVE');
    expect(wav.readUInt32LE(24)).toBe(AUDIO_SAMPLE_RATE_HZ);
    expect(wav.subarray(44).equals(pcm)).toBe(true);
  });
});
