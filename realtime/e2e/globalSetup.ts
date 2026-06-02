import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { E2E_REALTIME_PORT, readDevStackState, startDevStack } from './helpers/devStack.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const statePath = path.join(__dirname, '.e2e-state.json');

export type E2eState = {
  startedEmulator: boolean;
  emulatorPid: number | null;
  startedRealtime: boolean;
  realtimePid: number | null;
  realtimeBaseUrl: string;
};

export const readE2eState = (): E2eState => {
  const state = readDevStackState(statePath);
  return {
    startedEmulator: state.startedEmulator,
    emulatorPid: state.emulatorPid,
    startedRealtime: state.startedRealtime,
    realtimePid: state.realtimePid,
    realtimeBaseUrl: state.realtimeBaseUrl,
  };
};

export default async function globalSetup(): Promise<() => Promise<void>> {
  const { stop } = await startDevStack({
    realtimePort: E2E_REALTIME_PORT,
    startClient: false,
    statePath,
    logPrefix: 'e2e',
  });

  return async () => {
    stop();
  };
}
