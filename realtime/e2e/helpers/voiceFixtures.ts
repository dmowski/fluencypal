import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const voiceFixturesDir = path.join(__dirname, '../fixtures/voice');

export type VoiceFixtureName =
  | 'hello-24k-mono.wav'
  | 'silence-24k-mono.wav'
  | 'loud-interrupt-24k-mono.wav'
  | 'hello-48k-mono.wav';

const requiredApiFixtures: VoiceFixtureName[] = [
  'hello-24k-mono.wav',
  'silence-24k-mono.wav',
  'loud-interrupt-24k-mono.wav',
];

const requiredBrowserFixtures: VoiceFixtureName[] = ['hello-48k-mono.wav'];

export const voiceFixturePath = (name: VoiceFixtureName): string =>
  path.join(voiceFixturesDir, name);

export const voiceFixturesReady = (options: { browser?: boolean } = {}): boolean => {
  const names = options.browser
    ? [...requiredApiFixtures, ...requiredBrowserFixtures]
    : requiredApiFixtures;

  return names.every((name) => existsSync(voiceFixturePath(name)));
};

export const voiceFixturesSkipReason = (options: { browser?: boolean } = {}): string | null => {
  if (!process.env.OPENAI_API_KEY) {
    return 'OPENAI_API_KEY is not set';
  }

  if (!voiceFixturesReady(options)) {
    return `Voice fixtures missing — run: pnpm e2e:fixtures:voice (${voiceFixturesDir})`;
  }

  return null;
};
