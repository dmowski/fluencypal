import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import path from 'path';

/** Retina-quality baselines for visual review (2× CSS pixels). */
const BROWSER_VIEWPORT = { width: 1280, height: 900 };

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
      provider: playwright({
        contextOptions: {
          viewport: BROWSER_VIEWPORT,
          deviceScaleFactor: 2,
        },
      }),
      headless: true,
      instances: [{ browser: 'chromium' }],
      viewport: BROWSER_VIEWPORT,
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
