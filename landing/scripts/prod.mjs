#!/usr/bin/env node
/**
 * Build and deploy the landing app to Vercel production.
 *
 * Auth: VERCEL_TOKEN from the environment or landing/.env (gitignored).
 * Create a long-lived token at https://vercel.com/account/tokens — do not
 * rely on `vercel login`, whose session expires.
 *
 * Usage (from landing/):
 *   pnpm prod
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const landingRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const unquote = (value) => {
  if (
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    return value.slice(1, -1);
  }
  return value;
};

const parseEnvFile = (filePath) => {
  const env = {};
  const text = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    env[line.slice(0, eq).trim()] = unquote(line.slice(eq + 1));
  }
  return env;
};

const loadLandingEnv = () => {
  const merged = {};
  for (const fileName of ['.env', '.env.local']) {
    const filePath = path.join(landingRoot, fileName);
    if (!fs.existsSync(filePath)) continue;
    Object.assign(merged, parseEnvFile(filePath));
  }
  return merged;
};

const fileEnv = loadLandingEnv();
const token = process.env.VERCEL_TOKEN || fileEnv.VERCEL_TOKEN;

if (!token) {
  console.error(
    [
      'Missing VERCEL_TOKEN.',
      'Create one at https://vercel.com/account/tokens (expiration: never, or the longest available).',
      'Then add VERCEL_TOKEN=... to landing/.env (gitignored).',
    ].join('\n'),
  );
  process.exit(1);
}

const gitSha = spawnSync('git', ['rev-parse', 'HEAD'], {
  cwd: landingRoot,
  encoding: 'utf8',
});
if (gitSha.status !== 0) {
  console.error(gitSha.stderr || 'git rev-parse HEAD failed');
  process.exit(gitSha.status ?? 1);
}

const env = {
  ...process.env,
  VERCEL_TOKEN: token,
  SENTRY_LOAD_DOTENV: '0',
  SENTRY_RELEASE: process.env.SENTRY_RELEASE || gitSha.stdout.trim(),
};

if (!process.env.VERCEL_ORG_ID && fileEnv.VERCEL_ORG_ID) {
  env.VERCEL_ORG_ID = fileEnv.VERCEL_ORG_ID;
}
if (!process.env.VERCEL_PROJECT_ID && fileEnv.VERCEL_PROJECT_ID) {
  env.VERCEL_PROJECT_ID = fileEnv.VERCEL_PROJECT_ID;
}

const run = (command, args) => {
  const result = spawnSync(command, args, {
    cwd: landingRoot,
    env,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

run('vercel', ['build', '--prod']);
run('pnpm', ['run', 'create-git-build']);
run('vercel', ['deploy', '--prebuilt', '--prod', '--archive=tgz']);
