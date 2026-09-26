export class AuthTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthTokenError';
  }
}

export const isAuthTokenError = (error: unknown): error is AuthTokenError =>
  error instanceof AuthTokenError;

/** Expected auth failures should be 401s, not unhandled route errors. */
export const jsonIfAuthTokenError = (error: unknown): Response | null => {
  if (!isAuthTokenError(error)) return null;
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
};
