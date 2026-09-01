export type AuthWallStartStep = 'features' | 'auth';
export type AuthWallMethod = 'google' | 'email';

export function shouldStartPracticeAuthOnGoogle(rolePlayId: string | null | undefined): boolean {
  return Boolean(rolePlayId);
}

export function resolveAuthWallStartStep(input: {
  startOnAuth: boolean;
  lastAuthMethod: AuthWallMethod | null;
}): AuthWallStartStep {
  if (input.startOnAuth || input.lastAuthMethod) {
    return 'auth';
  }
  return 'features';
}
