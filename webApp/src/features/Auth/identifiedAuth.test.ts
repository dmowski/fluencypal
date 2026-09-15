import { isIdentifiedAuthUser } from './identifiedAuth';

describe('isIdentifiedAuthUser', () => {
  it('is false for missing or anonymous users', () => {
    expect(isIdentifiedAuthUser(null)).toBe(false);
    expect(isIdentifiedAuthUser(undefined)).toBe(false);
    expect(isIdentifiedAuthUser({ isAnonymous: true })).toBe(false);
  });

  it('is true for Google or email accounts', () => {
    expect(isIdentifiedAuthUser({ isAnonymous: false })).toBe(true);
    expect(isIdentifiedAuthUser({})).toBe(true);
  });
});
