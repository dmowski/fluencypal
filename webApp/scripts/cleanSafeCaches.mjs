#!/usr/bin/env node
/**
 * Remove gitignored caches that are safe to regenerate.
 *
 * Used as a pre-step for `pnpm dev:prod`, `pnpm lang`, and `pnpm lang-clean`.
 * Does not touch source, public assets, locale catalogs, node_modules
 * (except the Vite cache inside it), or Vercel project link files
 * (`.vercel/project.json`, `.vercel/.env.production`).
 *
 * Usage (from webApp/):
 *   pnpm clean:cache
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webAppRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const SAFE_CACHE_PATHS = [
  '.next',
  path.join('.vercel', 'output'),
  '.vitest-attachments',
  'playwright-report',
  'test-results',
  'coverage',
  'out',
  path.join('node_modules', '.vite'),
];

const isInsideWebApp = (absPath) => {
  const relative = path.relative(webAppRoot, absPath);
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
};

let removed = 0;

for (const relative of SAFE_CACHE_PATHS) {
  if (relative.split(/[\\/]/).includes('..')) {
    throw new Error(`Refusing path that escapes webApp: ${relative}`);
  }

  const absPath = path.join(webAppRoot, relative);
  if (!isInsideWebApp(absPath)) {
    throw new Error(`Refusing to delete path outside webApp: ${absPath}`);
  }
  if (!fs.existsSync(absPath)) {
    continue;
  }

  console.log(`Removing ${relative}...`);
  const result = spawnSync('rm', ['-rf', absPath], { stdio: 'inherit' });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`Failed to remove ${relative} (exit ${result.status})`);
  }
  removed += 1;
  console.log(`Removed ${relative}`);
}

if (removed === 0) {
  console.log('No cache folders to remove.');
} else {
  console.log(`Cleaned ${removed} cache path${removed === 1 ? '' : 's'}.`);
}
