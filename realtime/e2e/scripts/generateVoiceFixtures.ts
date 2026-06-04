/**
 * Generates real speech WAV fixtures via OpenAI TTS + ffmpeg.
 * Run: OPENAI_API_KEY=... pnpm e2e:fixtures:voice
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { config as loadDotenv } from 'dotenv';
import OpenAI from 'openai';
import { voiceFixturesDir } from '../helpers/voiceFixtures.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const realtimeRoot = path.resolve(__dirname, '../..');

loadDotenv({ path: path.join(realtimeRoot, '.env') });

type SpeechFixture = {
  fileName: string;
  text: string;
  sampleRate: number;
};

const speechSpecs: SpeechFixture[] = [
  { fileName: 'hello-24k-mono.wav', text: 'Hello.', sampleRate: 24_000 },
  { fileName: 'hello-48k-mono.wav', text: 'Hello.', sampleRate: 48_000 },
  {
    fileName: 'loud-interrupt-24k-mono.wav',
    text: 'Excuse me, stop talking please.',
    sampleRate: 24_000,
  },
];

const writeSilenceWav = (filePath: string, durationMs: number, sampleRate: number): void => {
  const sampleCount = Math.round((sampleRate * durationMs) / 1000);
  const dataBytes = sampleCount * 2;
  const buffer = Buffer.alloc(44 + dataBytes);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataBytes, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataBytes, 40);

  writeFileSync(filePath, buffer);
};

const resolveFfmpeg = async (): Promise<string> => {
  const which = spawnSync('which', ['ffmpeg'], { encoding: 'utf-8' });
  if (which.status === 0 && which.stdout.trim()) {
    return which.stdout.trim();
  }

  try {
    const mod = await import('ffmpeg-static');
    const binary = mod.default as unknown;
    if (typeof binary === 'string' && binary.length > 0) {
      return binary;
    }
  } catch {
    // optional dependency
  }

  throw new Error(
    'ffmpeg not found. Install ffmpeg (brew install ffmpeg) or allow ffmpeg-static build scripts in pnpm.',
  );
};

const convertMp3ToWav = (ffmpeg: string, mp3Path: string, wavPath: string, sampleRate: number): void => {
  const result = spawnSync(
    ffmpeg,
    ['-y', '-i', mp3Path, '-ar', String(sampleRate), '-ac', '1', '-sample_fmt', 's16', wavPath],
    { encoding: 'utf-8' },
  );

  if (result.status !== 0) {
    throw new Error(
      `ffmpeg failed for ${wavPath}: ${result.stderr || result.stdout || `exit ${result.status}`}`,
    );
  }
};

const main = async (): Promise<void> => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required to generate voice fixtures.');
  }

  const ffmpeg = await resolveFfmpeg();
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  mkdirSync(voiceFixturesDir, { recursive: true });

  const tmpDir = path.join(voiceFixturesDir, '.tmp');
  mkdirSync(tmpDir, { recursive: true });

  for (const spec of speechSpecs) {
    const mp3Path = path.join(tmpDir, `${spec.fileName}.mp3`);
    console.log(`Synthesizing: ${spec.text}`);

    const speech = await client.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: spec.text,
      response_format: 'mp3',
    });

    writeFileSync(mp3Path, Buffer.from(await speech.arrayBuffer()));

    const wavPath = path.join(voiceFixturesDir, spec.fileName);
    convertMp3ToWav(ffmpeg, mp3Path, wavPath, spec.sampleRate);
    console.log(`  wrote ${wavPath}`);
  }

  const silencePath = path.join(voiceFixturesDir, 'silence-24k-mono.wav');
  writeSilenceWav(silencePath, 400, 24_000);
  console.log(`  wrote ${silencePath}`);

  console.log(`Done. Fixtures in ${voiceFixturesDir}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
