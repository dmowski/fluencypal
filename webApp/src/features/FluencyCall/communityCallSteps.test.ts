import {
  communityCallPath,
  needsCommunityCallPageLanguage,
  nextCommunityCallStep,
  previousCommunityCallStep,
  resolveCommunityCallStep,
} from './communityCallSteps';

const full = {
  includePageLanguage: true,
  includeAccount: true,
  includeMembership: true,
};

describe('communityCallPath', () => {
  it('keeps page language, account, and membership when each one is needed', () => {
    expect(communityCallPath(full)).toEqual([
      'language',
      'calls',
      'native',
      'pageLanguage',
      'account',
      'membership',
      'waiting',
    ]);
  });

  it('skips page language when the native language is already a site language', () => {
    expect(needsCommunityCallPageLanguage('pl')).toBe(false);
    expect(needsCommunityCallPageLanguage('')).toBe(false);
    expect(needsCommunityCallPageLanguage('hi')).toBe(true);
    expect(
      communityCallPath({
        includePageLanguage: false,
        includeAccount: true,
        includeMembership: true,
      }),
    ).toEqual(['language', 'calls', 'native', 'account', 'membership', 'waiting']);
  });

  it('skips account and membership for someone who already has both', () => {
    expect(
      communityCallPath({
        includePageLanguage: false,
        includeAccount: false,
        includeMembership: false,
      }),
    ).toEqual(['language', 'calls', 'native', 'waiting']);
  });
});

describe('resolveCommunityCallStep', () => {
  const path = communityCallPath({
    includePageLanguage: false,
    includeAccount: false,
    includeMembership: true,
  });

  it('keeps a step that is still on the path', () => {
    expect(resolveCommunityCallStep('calls', path)).toBe('calls');
  });

  it('moves forward when the requested step was skipped', () => {
    expect(resolveCommunityCallStep('pageLanguage', path)).toBe('membership');
    expect(resolveCommunityCallStep('account', path)).toBe('membership');
  });

  it('falls back to the first step for an unknown value', () => {
    expect(resolveCommunityCallStep('date', path)).toBe('language');
  });
});

describe('community call neighbours', () => {
  const path = communityCallPath(full);

  it('walks forward and back', () => {
    expect(nextCommunityCallStep('language', path)).toBe('calls');
    expect(previousCommunityCallStep('calls', path)).toBe('language');
    expect(nextCommunityCallStep('waiting', path)).toBeNull();
    expect(previousCommunityCallStep('language', path)).toBeNull();
  });
});
