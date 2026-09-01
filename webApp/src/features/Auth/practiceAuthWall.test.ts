import { resolveAuthWallStartStep, shouldStartPracticeAuthOnGoogle } from './practiceAuthWall';

describe('shouldStartPracticeAuthOnGoogle', () => {
  it('is true when a scenario Play CTA lands on practice', () => {
    expect(shouldStartPracticeAuthOnGoogle('alias-game')).toBe(true);
    expect(shouldStartPracticeAuthOnGoogle('hotel-check-in')).toBe(true);
  });

  it('is false for generic practice and missing ids', () => {
    expect(shouldStartPracticeAuthOnGoogle(null)).toBe(false);
    expect(shouldStartPracticeAuthOnGoogle(undefined)).toBe(false);
    expect(shouldStartPracticeAuthOnGoogle('')).toBe(false);
  });
});

describe('resolveAuthWallStartStep', () => {
  it('opens on Google when a scenario skipped the intro', () => {
    expect(resolveAuthWallStartStep({ startOnAuth: true, lastAuthMethod: null })).toBe('auth');
  });

  it('opens on Google when the visitor already used an auth method', () => {
    expect(resolveAuthWallStartStep({ startOnAuth: false, lastAuthMethod: 'google' })).toBe('auth');
  });

  it('keeps the features intro for first-time generic practice', () => {
    expect(resolveAuthWallStartStep({ startOnAuth: false, lastAuthMethod: null })).toBe('features');
  });
});
