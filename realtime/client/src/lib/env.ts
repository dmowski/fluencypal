export type AppEnvironment = 'local' | 'production';

export const getAppEnvironment = (): AppEnvironment => {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'local';
  }
  return 'production';
};

export const isLocalDev = (): boolean => getAppEnvironment() === 'local';

export { isMobileDevice } from './authEnvironment.js';

/** Firebase Auth emulator is only available on localhost. */
export const shouldDefaultEmulator = (): boolean => isLocalDev();

export const getBackendLabel = (): string => {
  if (isLocalDev()) {
    return 'localhost:8081 (via Vite proxy)';
  }
  return window.location.host;
};
