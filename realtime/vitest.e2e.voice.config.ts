import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['e2e/voice.realtime.e2e.ts'],
    globalSetup: ['./e2e/globalSetup.ts'],
    fileParallelism: false,
    hookTimeout: 240_000,
    testTimeout: 240_000,
  },
});
