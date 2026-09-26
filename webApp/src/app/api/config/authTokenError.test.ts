import { AuthTokenError, isAuthTokenError, jsonIfAuthTokenError } from './authTokenError';

describe('authTokenError', () => {
  it('recognizes AuthTokenError', () => {
    expect(isAuthTokenError(new AuthTokenError('Invalid token'))).toBe(true);
    expect(isAuthTokenError(new Error('Invalid token'))).toBe(false);
  });

  it('maps auth failures to 401 and leaves other errors alone', async () => {
    const unauthorized = jsonIfAuthTokenError(new AuthTokenError('Invalid token'));
    expect(unauthorized?.status).toBe(401);
    expect(await unauthorized?.json()).toEqual({ error: 'Unauthorized' });
    expect(jsonIfAuthTokenError(new Error('AI request failed'))).toBeNull();
  });
});
