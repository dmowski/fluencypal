import { defineConfig, devices } from '@playwright/test';

const CLIENT_URL = 'http://127.0.0.1:5173';

export default defineConfig({
  testDir: './e2e/browser',
  globalSetup: './e2e/browser/globalSetup.ts',
  timeout: 60_000,
  expect: {
    timeout: 15_000,
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
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
        },
      },
    },
  ],
});
