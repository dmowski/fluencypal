import { EventEmitter } from 'events';
import { DemoSession } from './policy';
const sockets: FakeSocket[] = [];
class FakeSocket extends EventEmitter {
  static OPEN = 1;
  readyState = 1;
  sent: Record<string, unknown>[] = [];
  constructor() {
    super();
    sockets.push(this);
    queueMicrotask(() => this.emit('open'));
  }
  send(raw: string) {
    const event = JSON.parse(raw);
    this.sent.push(event);
    if (event.type === 'session.close')
      this.emit('message', JSON.stringify({ type: 'session.closed' }));
  }
  close() {
    this.readyState = 3;
    this.emit('close');
  }
}
const write = jest.fn().mockResolvedValue(undefined);
const update = jest.fn().mockResolvedValue(undefined);
const read = jest.fn();
jest.mock('ws', () => ({ __esModule: true, default: FakeSocket }));
jest.mock('./backend', () => ({ demoRef: () => ({ update }), readDemo: () => read() }));
jest.mock('@/app/api/config/firebase', () => {
  const ref = {
    collection: () => ref,
    doc: () => ref,
    set: (...args: unknown[]) => write(...args),
  };
  return { getDB: () => ref };
});
import { superviseDemo } from './supervise';
const session: DemoSession = {
  uid: 'guest',
  sessionId: 'live_demo',
  language: 'en',
  createdAt: 1000,
  startedAt: 1000,
  closedAt: null,
};
beforeEach(() => {
  jest.useFakeTimers({ doNotFake: ['queueMicrotask'] });
  jest.setSystemTime(1000);
  sockets.length = 0;
  jest.clearAllMocks();
  read.mockResolvedValue(session);
});
afterEach(() => jest.useRealTimers());
test('server warns and closes after three minutes without browser ticks', async () => {
  const run = await superviseDemo(session);
  const completion = run();
  sockets[0].emit(
    'message',
    JSON.stringify({ type: 'session.input_transcript.done', text: 'I like books.' }),
  );
  await jest.advanceTimersByTimeAsync(150_000);
  expect(sockets[0].sent.some((event) => event.event_id === 'demo-wrap-up')).toBe(true);
  await jest.advanceTimersByTimeAsync(30_000);
  await completion;
  expect(sockets[0].sent.some((event) => event.type === 'session.close')).toBe(true);
  expect(write).toHaveBeenCalledWith(
    expect.objectContaining({
      languageCode: 'en',
      messages: [expect.objectContaining({ text: 'I like books.' })],
    }),
  );
});
test('closes an unconnected demo after its setup allowance', async () => {
  read.mockResolvedValue({ ...session, startedAt: null });
  const run = await superviseDemo({ ...session, startedAt: null });
  const completion = run();
  await jest.advanceTimersByTimeAsync(30_000);
  await completion;
  expect(sockets[0].sent.some((event) => event.type === 'session.close')).toBe(true);
  expect(sockets[0].sent.some((event) => event.event_id === 'demo-greeting')).toBe(false);
});
test('reattaches to close if the control socket drops', async () => {
  const run = await superviseDemo(session);
  sockets[0].close();
  const completion = run();
  await jest.advanceTimersByTimeAsync(1000);
  await completion;
  expect(sockets).toHaveLength(2);
  expect(sockets[1].sent.some((event) => event.type === 'session.close')).toBe(true);
});

test('absolute watchdog closes even if the database stops responding', async () => {
  read.mockReturnValue(new Promise(() => undefined));
  const run = await superviseDemo(session);
  void run();
  await jest.advanceTimersByTimeAsync(210_000);
  expect(sockets[0].sent.some((event) => event.type === 'session.close')).toBe(true);
});
