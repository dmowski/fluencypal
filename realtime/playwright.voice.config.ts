import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';
import {
  CASE_2_MIC_WAV,
  USER_RECORDING_MIC_WAV,
  voiceFixturesDir,
} from './e2e/helpers/voiceFixtures.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_URL = 'http://127.0.0.1:5173';

const fakeMicArgs = (micFile: string): string[] => [
  '--use-fake-device-for-media-stream',
  '--use-fake-ui-for-media-stream',
  `--use-file-for-fake-audio-capture=${path.join(voiceFixturesDir, micFile)}`,
];

export default defineConfig({
  testDir: './e2e/browser',
  testMatch: 'voice.realtime.spec.ts',
  globalSetup: './e2e/browser/globalSetup.ts',
  timeout: 240_000,
  expect: {
    timeout: 90_000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: 'line',
  use: {
    baseURL: CLIENT_URL,
    trace: 'on-first-retry',
    permissions: ['microphone'],
  },
  projects: [
    {
      name: 'voice-whats-your-name',
      grep: /VC-09/,
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { args: fakeMicArgs(USER_RECORDING_MIC_WAV) },
      },
    },
    {
      name: 'voice-case-2',
      grep: /VC-10/,
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { args: fakeMicArgs(CASE_2_MIC_WAV) },
      },
    },
  ],
});
