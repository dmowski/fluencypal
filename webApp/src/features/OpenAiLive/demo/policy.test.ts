import { demoDeadline, DEMO_CONNECT_MS, DEMO_DURATION_MS, DemoSession } from './policy';
const session: DemoSession = {
  uid: 'guest',
  sessionId: 'live_1',
  language: 'en',
  createdAt: 1000,
  startedAt: null,
  closedAt: null,
};
test('connection setup has its own timeout', () => {
  expect(demoDeadline(session)).toBe(1000 + DEMO_CONNECT_MS);
});
test('gives three minutes once connected', () => {
  expect(demoDeadline({ ...session, startedAt: 6000 })).toBe(6000 + DEMO_DURATION_MS);
});
test('a delayed ready signal cannot extend the absolute limit', () => {
  expect(demoDeadline({ ...session, startedAt: 900_000 })).toBe(
    1000 + DEMO_CONNECT_MS + DEMO_DURATION_MS,
  );
});
