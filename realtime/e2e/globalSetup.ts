import { spawn, type ChildProcess } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const realtimeRoot = path.resolve(__dirname, '..');
const webAppRoot = path.resolve(realtimeRoot, '../webApp');
const statePath = path.join(realtimeRoot, 'e2e', '.e2e-state.json');

const EMULATOR_UI_PORT = 4000;
const AUTH_EMULATOR_PORT = 9099;
const REALTIME_E2E_PORT = 18081;
const FIREBASE_TOOLS_VERSION = '15.17.0';
const READY_TIMEOUT_MS = 120_000;

export type E2eState = {
  startedEmulator: boolean;
  emulatorPid: number | null;
  startedRealtime: boolean;
  realtimePid: number | null;
  realtimeBaseUrl: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForUrl = async (url: string, timeoutMs = READY_TIMEOUT_MS): Promise<void> => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // retry
    }

    await sleep(500);
  }

  throw new Error(`Timed out waiting for ${url}`);
};

const isEmulatorRunning = async (): Promise<boolean> => {
  try {
    const response = await fetch(`http://127.0.0.1:${EMULATOR_UI_PORT}/`);
    return response.ok;
  } catch {
    return false;
  }
};

const spawnProcess = (
  command: string,
  args: string[],
  options: { cwd: string; env?: NodeJS.ProcessEnv },
): ChildProcess => {
  const child = spawn(command, args, {
    cwd: options.cwd,
    env: { ...process.env, ...options.env },
    stdio: 'pipe',
    detached: process.platform !== 'win32',
  });

  child.stdout?.on('data', (chunk: Buffer) => {
    process.stdout.write(`[e2e:${command}] ${chunk.toString()}`);
  });

  child.stderr?.on('data', (chunk: Buffer) => {
    process.stderr.write(`[e2e:${command}] ${chunk.toString()}`);
  });

  return child;
};

const startFirebaseEmulator = (): ChildProcess => {
  return spawnProcess(
    'npx',
    [
      '-y',
      `firebase-tools@${FIREBASE_TOOLS_VERSION}`,
      'emulators:start',
      '--project',
      'dark-lang',
    ],
    { cwd: webAppRoot },
  );
};

const startRealtimeServer = (): ChildProcess => {
  return spawnProcess(
    'pnpm',
    ['exec', 'tsx', 'src/index.ts'],
    {
      cwd: realtimeRoot,
      env: {
        NODE_ENV: 'test',
        IS_FIREBASE_EMULATOR: 'true',
        FIREBASE_PROJECT_ID: 'dark-lang',
        FIREBASE_STORAGE_BUCKET: 'dark-lang.firebasestorage.app',
        REALTIME_PORT: String(REALTIME_E2E_PORT),
      },
    },
  );
};

const writeState = (state: E2eState) => {
  mkdirSync(path.dirname(statePath), { recursive: true });
  writeFileSync(statePath, JSON.stringify(state, null, 2));
};

export const readE2eState = (): E2eState => {
  return JSON.parse(readFileSync(statePath, 'utf-8')) as E2eState;
};

const waitForAuthEmulator = async (): Promise<void> => {
  const url = `http://127.0.0.1:${AUTH_EMULATOR_PORT}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`;
  const startedAt = Date.now();

  while (Date.now() - startedAt < READY_TIMEOUT_MS) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `probe-${Date.now()}@example.com`,
          password: 'Probe123!',
          returnSecureToken: true,
        }),
      });

      if (response.ok) {
        return;
      }
    } catch {
      // retry
    }

    await sleep(500);
  }

  throw new Error(`Auth emulator not ready on port ${AUTH_EMULATOR_PORT}`);
};

export default async function globalSetup(): Promise<() => Promise<void>> {
  let emulatorProcess: ChildProcess | null = null;
  let startedEmulator = false;

  if (!(await isEmulatorRunning())) {
    emulatorProcess = startFirebaseEmulator();
    startedEmulator = true;
    await waitForUrl(`http://127.0.0.1:${EMULATOR_UI_PORT}/`);
  }

  await waitForAuthEmulator();

  const realtimeProcess = startRealtimeServer();
  const realtimeBaseUrl = `http://127.0.0.1:${REALTIME_E2E_PORT}`;

  await waitForUrl(`${realtimeBaseUrl}/health`);

  writeState({
    startedEmulator,
    emulatorPid: emulatorProcess?.pid ?? null,
    startedRealtime: true,
    realtimePid: realtimeProcess.pid ?? null,
    realtimeBaseUrl,
  });

  return async () => {
    const state = readE2eState();

    if (state.startedRealtime && state.realtimePid) {
      try {
        process.kill(-state.realtimePid, 'SIGTERM');
      } catch {
        try {
          process.kill(state.realtimePid, 'SIGTERM');
        } catch {
          // already stopped
        }
      }
    }

    if (state.startedEmulator && state.emulatorPid) {
      try {
        process.kill(-state.emulatorPid, 'SIGTERM');
      } catch {
        try {
          process.kill(state.emulatorPid, 'SIGTERM');
        } catch {
          // already stopped
        }
      }
    }
  };
}
