import { exec } from 'node:child_process';
import {
  CLIENT_PORT,
  DEFAULT_REALTIME_PORT,
  freePorts,
  isDevStackReady,
  startDevStack,
} from '../e2e/helpers/devStack.js';

const openBrowser = !process.argv.includes('--no-open');

if (process.env.REUSE_DEV_SERVER === '1' && (await isDevStackReady(DEFAULT_REALTIME_PORT, CLIENT_PORT))) {
  console.log('');
  console.log('Reusing existing dev stack.');
  console.log(`  Test client:  http://127.0.0.1:${CLIENT_PORT}`);
  console.log(`  Realtime API: http://127.0.0.1:${DEFAULT_REALTIME_PORT}/health`);
  console.log('');
} else {
  await freePorts([DEFAULT_REALTIME_PORT, CLIENT_PORT]);
}

const { state, stop } = await startDevStack({
  realtimePort: DEFAULT_REALTIME_PORT,
  startClient: true,
  clientPort: CLIENT_PORT,
  logPrefix: 'dev',
  reuseIfReady: process.env.REUSE_DEV_SERVER === '1',
});

const shutdown = () => {
  stop();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log('');
console.log('FluencyPal realtime dev stack is running.');
console.log('');
console.log(`  Test client:  ${state.clientBaseUrl}`);
console.log(`  Realtime API: ${state.realtimeBaseUrl}/health`);
console.log(`  Auth emulator: http://127.0.0.1:9099`);
console.log('');
console.log('Sign in on the test page (Auth emulator is pre-enabled). Press Ctrl+C to stop.');
console.log('');

if (openBrowser && process.env.CI !== 'true') {
  const url = state.clientBaseUrl;
  const command =
    process.platform === 'darwin'
      ? `open "${url}"`
      : process.platform === 'win32'
        ? `start "" "${url}"`
        : `xdg-open "${url}"`;

  exec(command, (error) => {
    if (error) {
      console.warn(`Could not open browser automatically: ${error.message}`);
    }
  });
}

await new Promise<void>(() => {
  // Keep the dev stack alive until interrupted.
});
