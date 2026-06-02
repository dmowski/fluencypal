import { toFile } from 'openai';
import type { SttProvider, SttResult, SttOptions } from '../types.js';
import { pcm16ToWav } from '../pcm16ToWav.js';
import { getOpenAiClient } from './client.js';

const emptyUsage = { input_tokens: 0, output_tokens: 0, total_tokens: 0 };

const normalizeTranscript = (text: string): string => {
  const trimmed = text.trim();
  const ignored = new Set(['', 'n/a', 'no speech', 'silence', '...']);
  return ignored.has(trimmed.toLowerCase()) ? '' : trimmed;
};

export const openAiSttProvider: SttProvider = {
  async transcribeBatch(audioPcm16, options): Promise<SttResult> {
    if (audioPcm16.length === 0) {
      return { text: '', usage: emptyUsage };
    }

    const wav = pcm16ToWav(audioPcm16);
    const file = await toFile(wav, 'turn.wav', { type: 'audio/wav' });
    const client = getOpenAiClient();

    const result = await client.audio.transcriptions.create(
      {
        file,
        model: options.model,
        language: options.languageCode,
        prompt: 'Transcribe the spoken language practice audio. Keep grammar mistakes.',
      },
      { signal: options.signal },
    );

    const usage = result.usage;
    const tokenUsage =
      usage && 'input_tokens' in usage
        ? {
            input_tokens: usage.input_tokens ?? 0,
            output_tokens: usage.output_tokens ?? 0,
            total_tokens: usage.total_tokens ?? 0,
          }
        : {
            input_tokens: 0,
            output_tokens: 0,
            total_tokens: 0,
          };

    return {
      text: normalizeTranscript(result.text ?? ''),
      usage: tokenUsage,
    };
  },
};
