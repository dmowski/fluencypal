import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import path from 'path';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    name: 'browser',
    include: ['src/**/*.browser.test.{ts,tsx}'],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
      expect: {
        toMatchScreenshot: {
          // Committed baselines live next to the test file (not gitignored __screenshots__).
          resolveScreenshotPath: ({ arg, ext, root, testFileDirectory }) =>
            path.join(root, testFileDirectory, 'screenshots', `${arg}${ext}`),
        },
      },
    },
  },
});
