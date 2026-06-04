import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_URL = 'http://127.0.0.1:5173';
const helloMicFile = path.join(__dirname, 'e2e/fixtures/voice/hello-48k-mono.wav');

export default defineConfig({
  testDir: './e2e/browser',
  testMatch: 'voice.realtime.spec.ts',
  globalSetup: './e2e/browser/globalSetup.ts',
  timeout: 180_000,
  expect: {
    timeout: 60_000,
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
      name: 'chromium-voice',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--use-fake-device-for-media-stream',
            '--use-fake-ui-for-media-stream',
            `--use-file-for-fake-audio-capture=${helloMicFile}`,
          ],
        },
      },
    },
  ],
});
