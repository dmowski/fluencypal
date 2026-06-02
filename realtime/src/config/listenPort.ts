import { env } from './env.js';

/** Fly.io sets PORT; REALTIME_PORT wins when explicitly configured. */
export const getListenPort = (): number => {
  if (process.env.REALTIME_PORT !== undefined && process.env.REALTIME_PORT !== '') {
    return env.REALTIME_PORT;
  }

  const platformPort = Number(process.env.PORT);
  if (Number.isFinite(platformPort) && platformPort > 0) {
    return platformPort;
  }

  return env.REALTIME_PORT;
};
