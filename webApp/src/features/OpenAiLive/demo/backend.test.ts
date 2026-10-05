const data = new Map<string, Record<string, unknown>>();
const doc = (id: string) => ({ id });
const tx = {
  getAll: async (...refs: { id: string }[]) =>
    refs.map((ref) => ({ exists: data.has(ref.id), data: () => data.get(ref.id) })),
  create: (ref: { id: string }, value: Record<string, unknown>) => data.set(ref.id, value),
  set: (ref: { id: string }, value: Record<string, unknown>) => data.set(ref.id, value),
};
jest.mock('@/app/api/config/firebase', () => ({
  getDB: () => ({
    collection: (name: string) => ({ doc: (id: string) => doc(`${name}/${id}`) }),
    runTransaction: (fn: (value: typeof tx) => unknown) => fn(tx),
  }),
}));
import { reserveDemo } from './backend';
beforeEach(() => {
  data.clear();
  delete process.env.OPEN_AI_LIVE_DEMO_DAILY_LIMIT;
});
afterAll(() => {
  delete process.env.OPEN_AI_LIVE_DEMO_DAILY_LIMIT;
});
test('blocks another demo for the same anonymous identity', async () => {
  await reserveDemo('guest', '1.2.3.4');
  await expect(reserveDemo('guest', '5.6.7.8')).rejects.toThrow('already been used');
});
test('limits repeated identity creation on the same network', async () => {
  for (let i = 0; i < 3; i++) await reserveDemo(`guest${i}`, '1.2.3.4');
  await expect(reserveDemo('guest4', '1.2.3.4')).rejects.toThrow('capacity');
});
test('caps all networks and fails closed on invalid configuration', async () => {
  process.env.OPEN_AI_LIVE_DEMO_DAILY_LIMIT = '1';
  await reserveDemo('one', 'one');
  await expect(reserveDemo('two', 'two')).rejects.toThrow('capacity');
  data.clear();
  process.env.OPEN_AI_LIVE_DEMO_DAILY_LIMIT = 'invalid';
  await expect(reserveDemo('three', 'three')).rejects.toThrow('capacity');
});
