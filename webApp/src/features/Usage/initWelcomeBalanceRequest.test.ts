import {
  initWelcomeBalanceRequest,
  isInitBalanceUnauthorizedError,
} from './initWelcomeBalanceRequest';

describe('initWelcomeBalanceRequest', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not retry a 401', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }));

    await expect(
      initWelcomeBalanceRequest({}, 'token', { sleep: async () => undefined }),
    ).rejects.toThrow('initWelcomeBalanceRequest failed with status 401');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries a 500 and returns the later success', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response('nope', { status: 500 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ done: true }), { status: 200 }));

    await expect(
      initWelcomeBalanceRequest({}, 'token', { sleep: async () => undefined }),
    ).resolves.toEqual({ done: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe('isInitBalanceUnauthorizedError', () => {
  it('matches 401 request failures', () => {
    expect(
      isInitBalanceUnauthorizedError(new Error('initWelcomeBalanceRequest failed with status 401')),
    ).toBe(true);
  });

  it('rejects other failures', () => {
    expect(
      isInitBalanceUnauthorizedError(new Error('initWelcomeBalanceRequest failed with status 500')),
    ).toBe(false);
    expect(isInitBalanceUnauthorizedError(null)).toBe(false);
  });
});
