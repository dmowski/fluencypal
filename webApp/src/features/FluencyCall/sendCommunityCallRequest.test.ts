import { sendCommunityCallRequest } from './sendCommunityCallRequest';

describe('sendCommunityCallRequest', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('sends the signed-in token when the app has one', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ error: '' }), { status: 200 }));

    await sendCommunityCallRequest('c1, speaking', 'WhatsApp 15873708005', 'signed-in-token');

    expect(fetchMock).toHaveBeenCalledWith('/api/community-call/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer signed-in-token',
      },
      body: JSON.stringify({ interests: 'c1, speaking', contact: 'WhatsApp 15873708005' }),
    });
  });

  it('omits auth when nobody is signed in', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ error: '' }), { status: 200 }));

    await sendCommunityCallRequest('travel', 'ada@example.com');

    expect(fetchMock.mock.calls[0][1].headers).toEqual({ 'Content-Type': 'application/json' });
  });
});
