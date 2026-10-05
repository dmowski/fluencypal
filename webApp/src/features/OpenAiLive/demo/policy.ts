export const DEMO_DURATION_MS = 180_000;
export const DEMO_CONNECT_MS = 30_000;
export const DEMO_WARNING_MS = 30_000;
export const DEMO_DAILY_LIMIT = 100;
export const DEMO_IP_DAILY_LIMIT = 3;

export type DemoSession = {
  uid: string;
  sessionId: string;
  language: string;
  createdAt: number;
  startedAt: number | null;
  closedAt: number | null;
};

export const demoDeadline = (session: DemoSession) =>
  session.startedAt === null
    ? session.createdAt + DEMO_CONNECT_MS
    : Math.min(session.startedAt, session.createdAt + DEMO_CONNECT_MS) + DEMO_DURATION_MS;
