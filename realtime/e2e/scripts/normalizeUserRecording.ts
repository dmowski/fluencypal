import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  USER_RECORDING_WAV_FILES,
  micWavForRecording,
  voiceFixturesDir,
} from '../helpers/voiceFixtures.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const resolveFfmpeg = (): string => {
  const which = spawnSync('which', ['ffmpeg'], { encoding: 'utf-8' });
  if (which.status === 0 && which.stdout.trim()) {
    return which.stdout.trim();
  }

  throw new Error('ffmpeg not found (brew install ffmpeg)');
};

const convertWav = (ffmpeg: string, input: string, output: string, sampleRate: number): void => {
  const result = spawnSync(
    ffmpeg,
    ['-y', '-i', input, '-ar', String(sampleRate), '-ac', '1', '-sample_fmt', 's16', output],
    { encoding: 'utf-8' },
  );

  if (result.status !== 0) {
    throw new Error(
      `ffmpeg failed for ${output}: ${result.stderr || result.stdout || `exit ${result.status}`}`,
    );
  }
};

const main = (): void => {
  mkdirSync(voiceFixturesDir, { recursive: true });
  const ffmpeg = resolveFfmpeg();
  let wrote = 0;

  for (const recording of USER_RECORDING_WAV_FILES) {
    const source = path.join(voiceFixturesDir, recording);
    if (!existsSync(source)) {
      console.warn(`Skip (missing): ${source}`);
      continue;
    }

    const micOut = path.join(voiceFixturesDir, micWavForRecording(recording));
    convertWav(ffmpeg, source, micOut, 48_000);
    console.log(`Wrote ${micOut}`);
    wrote += 1;
  }

  if (wrote === 0) {
    throw new Error(
      `No recordings found. Add at least one of: ${USER_RECORDING_WAV_FILES.join(', ')}`,
    );
  }
};

main();
