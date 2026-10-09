import { emailLinkConfirmFailure, resolveEmailLinkArrival } from './emailLinkArrival';

describe('resolveEmailLinkArrival', () => {
  it('ignores a normal page', () => {
    expect(resolveEmailLinkArrival({ isEmailLink: false, storedEmail: null })).toBe('skip');
  });

  it('finishes when this browser stored the email', () => {
    expect(
      resolveEmailLinkArrival({ isEmailLink: true, storedEmail: 'ada@example.com' }),
    ).toBe('complete');
  });

  it('asks when the link was opened in another browser', () => {
    expect(resolveEmailLinkArrival({ isEmailLink: true, storedEmail: null })).toBe('ask');
    expect(resolveEmailLinkArrival({ isEmailLink: true, storedEmail: '  ' })).toBe('ask');
  });
});

describe('emailLinkConfirmFailure', () => {
  it('keeps a wrong or expired link retryable', () => {
    expect(emailLinkConfirmFailure('auth/invalid-action-code')).toBe('mismatch');
    expect(emailLinkConfirmFailure('auth/expired-action-code')).toBe('mismatch');
    expect(emailLinkConfirmFailure('auth/network-request-failed')).toBe('failed');
  });
});
