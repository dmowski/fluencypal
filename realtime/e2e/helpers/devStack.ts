import { spawn, type ChildProcess } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadDotenv } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const realtimeRoot = path.resolve(__dirname, '../..');
export const webAppRoot = path.resolve(realtimeRoot, '../webApp');

loadDotenv({ path: path.join(realtimeRoot, '.env') });

export const EMULATOR_UI_PORT = 4000;
export const AUTH_EMULATOR_PORT = 9099;
export const FIRESTORE_EMULATOR_PORT = 8080;
export const STORAGE_EMULATOR_PORT = 9199;
export const DEFAULT_REALTIME_PORT = 8081;
export const E2E_REALTIME_PORT = 18081;
export const CLIENT_PORT = 5173;
export const FIREBASE_TOOLS_VERSION = '15.17.0';
export const READY_TIMEOUT_MS = 120_000;

export type DevStackState = {
  startedEmulator: boolean;
  emulatorPid: number | null;
  startedRealtime: boolean;
  realtimePid: number | null;
  startedClient: boolean;
  clientPid: number | null;
  realtimeBaseUrl: string;
  clientBaseUrl: string;
};

export type StartDevStackOptions = {
  realtimePort?: number;
  startClient?: boolean;
  clientPort?: number;
  statePath?: string;
  logPrefix?: string;
  reuseIfReady?: boolean;
  /** Restart the realtime API when `src/` changes (`tsx watch`). Default true. */
  watchRealtime?: boolean;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const freePort = async (port: number): Promise<void> => {
  if (process.platform === 'win32') {
    return;
  }

  try {
    const result = spawn('lsof', ['-ti', `:${port}`], { stdio: ['ignore', 'pipe', 'ignore'] });
    const stdout = await new Promise<string>((resolve) => {
      let data = '';
      result.stdout?.on('data', (chunk: Buffer) => {
        data += chunk.toString();
      });
      result.on('close', () => resolve(data.trim()));
    });

    if (!stdout) {
      return;
    }

    for (const pidText of stdout.split('\n')) {
      const pid = Number(pidText);
      if (Number.isFinite(pid) && pid > 0) {
        try {
          process.kill(pid, 'SIGTERM');
        } catch {
          // already stopped
        }
      }
    }

    await sleep(500);
  } catch {
    // port already free or lsof unavailable
  }
};

export const freePorts = async (ports: number[]): Promise<void> => {
  for (const port of ports) {
    await freePort(port);
  }
};

export const waitForUrl = async (url: string, timeoutMs = READY_TIMEOUT_MS): Promise<void> => {
  const startedAt = Date.now();
  const hosts = ['127.0.0.1', 'localhost'];
  const urlObject = new URL(url);

  while (Date.now() - startedAt < timeoutMs) {
    for (const host of hosts) {
      const candidate = `${urlObject.protocol}//${host}:${urlObject.port}${urlObject.pathname}`;

      try {
        const response = await fetch(candidate);
        if (response.ok) {
          return;
        }
      } catch {
        // retry
      }
    }

    await sleep(500);
  }

  throw new Error(`Timed out waiting for ${url}`);
};

const authEmulatorProbeUrl = (): string =>
  `http://127.0.0.1:${AUTH_EMULATOR_PORT}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`;

/** Auth emulator is the signal realtime dev/e2e need; UI port 4000 may be off while auth is up. */
export const isAuthEmulatorReady = async (): Promise<boolean> => {
  try {
    const response = await fetch(authEmulatorProbeUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `probe-${Date.now()}@example.com`,
        password: 'Probe123!',
        returnSecureToken: true,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
};

export const isEmulatorRunning = async (): Promise<boolean> => isAuthEmulatorReady();

export const isPortInUse = async (port: number): Promise<boolean> => {
  if (process.platform === 'win32') {
    return false;
  }

  try {
    const result = spawn('lsof', ['-ti', `:${port}`], { stdio: ['ignore', 'pipe', 'ignore'] });
    const stdout = await new Promise<string>((resolve) => {
      let data = '';
      result.stdout?.on('data', (chunk: Buffer) => {
        data += chunk.toString();
      });
      result.on('close', () => resolve(data.trim()));
    });

    return stdout.length > 0;
  } catch {
    return false;
  }
};

const waitForAuthEmulator = async (): Promise<void> => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < READY_TIMEOUT_MS) {
    if (await isAuthEmulatorReady()) {
      return;
    }

    await sleep(500);
  }

  throw new Error(`Auth emulator not ready on port ${AUTH_EMULATOR_PORT}`);
};

const buildEmulatorStartArgs = async (logPrefix: string): Promise<string[]> => {
  const args = [
    '-y',
    `firebase-tools@${FIREBASE_TOOLS_VERSION}`,
    'emulators:start',
    '--project',
    'dark-lang',
  ];

  const firestoreBusy = await isPortInUse(FIRESTORE_EMULATOR_PORT);
  const storageBusy = await isPortInUse(STORAGE_EMULATOR_PORT);

  if (firestoreBusy || storageBusy) {
    const only: string[] = ['auth'];
    if (!storageBusy) {
      only.push('storage');
    }

    const skipped = [
      firestoreBusy ? `Firestore (${FIRESTORE_EMULATOR_PORT})` : null,
      storageBusy ? `Storage (${STORAGE_EMULATOR_PORT})` : null,
    ].filter(Boolean);

    console.warn(
      `[${logPrefix}] Port(s) in use (${skipped.join(', ')}). Starting Firebase emulators: ${only.join(', ')} only.`,
    );
    args.push('--only', only.join(','));
  }

  return args;
};

const spawnProcess = (
  command: string,
  args: string[],
  options: { cwd: string; env?: NodeJS.ProcessEnv; logPrefix?: string },
): ChildProcess => {
  const prefix = options.logPrefix ?? command;
  const child = spawn(command, args, {
    cwd: options.cwd,
    env: { ...process.env, ...options.env },
    stdio: 'pipe',
    detached: process.platform !== 'win32',
  });

  child.stdout?.on('data', (chunk: Buffer) => {
    process.stdout.write(`[${prefix}] ${chunk.toString()}`);
  });

  child.stderr?.on('data', (chunk: Buffer) => {
    process.stderr.write(`[${prefix}] ${chunk.toString()}`);
  });

  return child;
};

const killProcess = (pid: number | null): void => {
  if (!pid) {
    return;
  }

  try {
    process.kill(-pid, 'SIGTERM');
  } catch {
    try {
      process.kill(pid, 'SIGTERM');
    } catch {
      // already stopped
    }
  }
};

export const writeDevStackState = (statePath: string, state: DevStackState): void => {
  mkdirSync(path.dirname(statePath), { recursive: true });
  writeFileSync(statePath, JSON.stringify(state, null, 2));
};

export const readDevStackState = (statePath: string): DevStackState => {
  return JSON.parse(readFileSync(statePath, 'utf-8')) as DevStackState;
};

export const isDevStackReady = async (
  realtimePort = DEFAULT_REALTIME_PORT,
  clientPort = CLIENT_PORT,
): Promise<boolean> => {
  try {
    const healthResponse = await fetch(`http://127.0.0.1:${realtimePort}/health`);
    if (!healthResponse.ok) {
      return false;
    }

    const health = (await healthResponse.json()) as { firebaseEmulator?: boolean };
    if (health.firebaseEmulator !== true) {
      return false;
    }

    await waitForUrl(`http://127.0.0.1:${clientPort}/`, 5_000);
    return true;
  } catch {
    return false;
  }
};

export const startDevStack = async (options: StartDevStackOptions = {}): Promise<{
  state: DevStackState;
  stop: () => void;
}> => {
  const realtimePort = options.realtimePort ?? DEFAULT_REALTIME_PORT;
  const clientPort = options.clientPort ?? CLIENT_PORT;
  const startClient = options.startClient ?? false;
  const logPrefix = options.logPrefix ?? 'dev';

  if (options.reuseIfReady && (await isDevStackReady(realtimePort, startClient ? clientPort : CLIENT_PORT))) {
    const state: DevStackState = {
      startedEmulator: false,
      emulatorPid: null,
      startedRealtime: false,
      realtimePid: null,
      startedClient: false,
      clientPid: null,
      realtimeBaseUrl: `http://127.0.0.1:${realtimePort}`,
      clientBaseUrl: `http://127.0.0.1:${clientPort}`,
    };

    if (options.statePath) {
      writeDevStackState(options.statePath, state);
    }

    return { state, stop: () => {} };
  }

  let emulatorProcess: ChildProcess | null = null;
  let startedEmulator = false;

  if (!(await isEmulatorRunning())) {
    emulatorProcess = spawnProcess('npx', await buildEmulatorStartArgs(logPrefix), {
      cwd: webAppRoot,
      logPrefix: `${logPrefix}:emulator`,
    });
    startedEmulator = true;

    const waitForEmulatorReady = async (): Promise<void> => {
      const startedAt = Date.now();
      while (Date.now() - startedAt < READY_TIMEOUT_MS) {
        if (await isAuthEmulatorReady()) {
          return;
        }

        if (emulatorProcess && emulatorProcess.exitCode !== null && emulatorProcess.exitCode !== 0) {
          if (await isAuthEmulatorReady()) {
            return;
          }

          throw new Error(
            `Firebase emulators exited with code ${emulatorProcess.exitCode}. ` +
              `Free ports ${FIRESTORE_EMULATOR_PORT}/${AUTH_EMULATOR_PORT}/${STORAGE_EMULATOR_PORT} ` +
              'or run `cd webApp && pnpm dev:firebase-emulator` first.',
          );
        }

        await sleep(500);
      }

      throw new Error(`Timed out waiting for Auth emulator on port ${AUTH_EMULATOR_PORT}`);
    };

    await waitForEmulatorReady();
  }

  await waitForAuthEmulator();

  const watchRealtime = options.watchRealtime ?? true;
  const realtimeProcess = spawnProcess(
    'pnpm',
    watchRealtime
      ? ['exec', 'tsx', 'watch', 'src/index.ts']
      : ['exec', 'tsx', 'src/index.ts'],
    {
      cwd: realtimeRoot,
      logPrefix: `${logPrefix}:api`,
      env: {
        NODE_ENV: 'development',
        IS_FIREBASE_EMULATOR: 'true',
        FIREBASE_PROJECT_ID: 'dark-lang',
        FIREBASE_STORAGE_BUCKET: 'dark-lang.firebasestorage.app',
        REALTIME_PORT: String(realtimePort),
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
      },
    },
  );

  const realtimeBaseUrl = `http://127.0.0.1:${realtimePort}`;
  await waitForUrl(`${realtimeBaseUrl}/health`);

  let clientProcess: ChildProcess | null = null;
  const clientBaseUrl = `http://127.0.0.1:${clientPort}`;

  if (startClient) {
    clientProcess = spawnProcess(
      'pnpm',
      [
        'exec',
        'vite',
        '--config',
        'client/vite.config.ts',
        '--host',
        '127.0.0.1',
        '--port',
        String(clientPort),
        '--strictPort',
      ],
      {
        cwd: realtimeRoot,
        logPrefix: `${logPrefix}:client`,
        env: {
          VITE_DEV_SERVER_PORT: String(clientPort),
        },
      },
    );

    await waitForUrl(clientBaseUrl);
  }

  const state: DevStackState = {
    startedEmulator,
    emulatorPid: emulatorProcess?.pid ?? null,
    startedRealtime: true,
    realtimePid: realtimeProcess.pid ?? null,
    startedClient: startClient,
    clientPid: clientProcess?.pid ?? null,
    realtimeBaseUrl,
    clientBaseUrl,
  };

  if (options.statePath) {
    writeDevStackState(options.statePath, state);
  }

  const stop = (): void => {
    killProcess(clientProcess?.pid ?? null);
    killProcess(realtimeProcess.pid ?? null);

    if (startedEmulator) {
      killProcess(emulatorProcess?.pid ?? null);
    }
  };

  return { state, stop };
};
