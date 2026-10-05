import { createOpenAiLiveSession } from './createLiveSession';
const originalFetch = global.fetch;
const originalKey = process.env.OPENAI_API_KEY;
let fetchMock: jest.Mock;
beforeEach(() => {
  process.env.OPENAI_API_KEY = 'test-key';
  fetchMock = jest
    .fn()
    .mockResolvedValue({
      ok: true,
      json: async () => ({ session: { id: 'live_test' }, transport: { sdp: 'answer' } }),
    });
  global.fetch = fetchMock;
});
afterAll(() => {
  global.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = originalKey;
});
const input = { userId: 'guest', sdp: 'offer', instructions: 'Practice English.', voice: 'marin' };
test('demo browsers cannot change prompts or invoke backend model work directly', async () => {
  await createOpenAiLiveSession({ ...input, demo: true });
  const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
  expect(payload.session.client.data_channel.allowed_client_events).toEqual([
    'session.input_audio.mute',
    'session.input_audio.unmute',
    'session.close',
  ]);
  expect(payload.session.delegation.responses.max_output_tokens).toBe(256);
});
test('paid conversations retain their existing data channel permissions', async () => {
  await createOpenAiLiveSession(input);
  expect(JSON.parse(fetchMock.mock.calls[0][1].body).session.client).toBeUndefined();
});
