export interface AuthUserInfo {
  uid: string;
  email: string;
}

export type AuthErrorCode = 'missing_header' | 'missing_token' | 'invalid_token';

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}
