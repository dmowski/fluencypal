import { sendTextAiRequest } from './sendTextAiRequest';

const request = {
  systemMessage: 'system',
  userMessage: 'hello',
  languageCode: 'en' as const,
  model: 'gpt-4o-mini' as const,
};

describe('sendTextAiRequest', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('refreshes the ID token once after a 401 and does not retry the rejected token', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ aiResponse: 'ok', usageEvent: {} }), { status: 200 }),
      );
    const refreshAuth = jest.fn(async () => 'fresh-token');

    const result = await sendTextAiRequest(request, 'stale-token', 3, refreshAuth);

    expect(result.aiResponse).toBe('ok');
    expect(refreshAuth).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer fresh-token');
  });

  it('does not refresh again when the new token is also rejected', async () => {
    fetchMock.mockImplementation(async () => new Response('Unauthorized', { status: 401 }));
    const refreshAuth = jest.fn(async () => 'fresh-token');

    await expect(sendTextAiRequest(request, 'stale-token', 3, refreshAuth)).rejects.toThrow(
      'status 401',
    );

    expect(refreshAuth).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
