#!/usr/bin/env node
/**
 * Deploy Firestore indexes from firestore.indexes.json using the service
 * account in webApp/.env (FIREBASE_STORAGE_SERVICE_ACCOUNT_CREDS).
 *
 * Usage (from webApp/):
 *   pnpm firestore:indexes
 */
import { spawn } from 'node:child_process';
import {
  PROJECT_ID,
  resolveFirebaseCli,
  webAppRoot,
  withServiceAccountFile,
} from './firebaseEnv.mjs';

const run = (command, args, extraEnv) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: webAppRoot,
      stdio: 'inherit',
      env: { ...process.env, ...extraEnv },
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });

try {
  await withServiceAccountFile(async (credentialsPath) => {
    const { command, prefix } = resolveFirebaseCli();
    const args = [
      ...prefix,
      'deploy',
      '--only',
      'firestore:indexes',
      '--project',
      PROJECT_ID,
      '--non-interactive',
    ];
    console.log(`Deploying Firestore indexes to ${PROJECT_ID}…`);
    await run(command, args, { GOOGLE_APPLICATION_CREDENTIALS: credentialsPath });
    console.log(
      'Index deploy submitted. Composite indexes can take a few minutes to become READY.',
    );
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
