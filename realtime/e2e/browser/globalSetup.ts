import {
  CLIENT_PORT,
  DEFAULT_REALTIME_PORT,
  freePorts,
  isDevStackReady,
  startDevStack,
} from '../helpers/devStack.js';

export default async function globalSetup(): Promise<() => Promise<void>> {
  if (process.env.REUSE_DEV_SERVER === '1' && (await isDevStackReady(DEFAULT_REALTIME_PORT, CLIENT_PORT))) {
    return async () => {};
  }

  await freePorts([DEFAULT_REALTIME_PORT, CLIENT_PORT]);

  const { stop } = await startDevStack({
    realtimePort: DEFAULT_REALTIME_PORT,
    startClient: true,
    clientPort: CLIENT_PORT,
    logPrefix: 'browser-e2e',
    watchRealtime: false,
  });

  return async () => {
    stop();
  };
}
