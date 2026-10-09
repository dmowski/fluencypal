export type EmailLinkArrival = 'skip' | 'complete' | 'ask';

/** Same browser can finish immediately. Another browser must ask for the email. */
export const resolveEmailLinkArrival = ({
  isEmailLink,
  storedEmail,
}: {
  isEmailLink: boolean;
  storedEmail: string | null;
}): EmailLinkArrival => {
  if (!isEmailLink) return 'skip';
  if (storedEmail?.trim()) return 'complete';
  return 'ask';
};

/** A wrong address and an expired link share Firebase's action-code errors. */
export const emailLinkConfirmFailure = (code: string): 'mismatch' | 'failed' => {
  if (
    code === 'auth/invalid-action-code' ||
    code === 'auth/expired-action-code' ||
    code === 'auth/invalid-email'
  ) {
    return 'mismatch';
  }
  return 'failed';
};
