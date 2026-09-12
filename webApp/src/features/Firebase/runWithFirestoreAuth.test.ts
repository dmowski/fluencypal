import { runWithFirestoreAuth } from './runWithFirestoreAuth';

describe('runWithFirestoreAuth', () => {
  it('writes after a token is available', async () => {
    const write = jest.fn(async () => 'ok');

    await expect(runWithFirestoreAuth(async () => 'token', write)).resolves.toBe('ok');
    expect(write).toHaveBeenCalledTimes(1);
  });

  it('refreshes the token and retries a permission-denied write', async () => {
    const getToken = jest.fn(async (forceRefresh?: boolean) =>
      forceRefresh ? 'refreshed' : 'stale',
    );
    const write = jest
      .fn()
      .mockRejectedValueOnce({ code: 'permission-denied' })
      .mockResolvedValueOnce('ok');

    await expect(runWithFirestoreAuth(getToken, write)).resolves.toBe('ok');
    expect(getToken).toHaveBeenNthCalledWith(1);
    expect(getToken).toHaveBeenNthCalledWith(2, true);
    expect(write).toHaveBeenCalledTimes(2);
  });

  it('does not retry unrelated errors', async () => {
    const write = jest.fn(async () => {
      throw new Error('unavailable');
    });

    await expect(runWithFirestoreAuth(async () => 'token', write)).rejects.toThrow('unavailable');
    expect(write).toHaveBeenCalledTimes(1);
  });

  it('rejects when there is no auth token', async () => {
    const write = jest.fn(async () => 'ok');

    await expect(runWithFirestoreAuth(async () => '', write)).rejects.toThrow(
      'Cannot write to Firestore without an auth token',
    );
    expect(write).not.toHaveBeenCalled();
  });
});
