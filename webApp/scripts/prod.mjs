#!/usr/bin/env node
/**
 * Build and deploy the web app to Vercel production.
 *
 * Auth: VERCEL_TOKEN from the environment or webApp/.env (gitignored).
 * Create a long-lived token at https://vercel.com/account/tokens — do not
 * rely on `vercel login`, whose session expires.
 *
 * Usage (from webApp/):
 *   pnpm prod
 */
import { spawnSync } from 'node:child_process';
import { loadWebAppEnv, webAppRoot } from './firebaseEnv.mjs';

const fileEnv = loadWebAppEnv();
const token = process.env.VERCEL_TOKEN || fileEnv.VERCEL_TOKEN;

if (!token) {
  console.error(
    [
      'Missing VERCEL_TOKEN.',
      'Create one at https://vercel.com/account/tokens (expiration: never, or the longest available).',
      'Then add VERCEL_TOKEN=... to webApp/.env (gitignored).',
    ].join('\n'),
  );
  process.exit(1);
}

const gitSha = spawnSync('git', ['rev-parse', 'HEAD'], {
  cwd: webAppRoot,
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
    cwd: webAppRoot,
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
