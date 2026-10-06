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
};

describe('communityCallPath', () => {
  it('keeps page language and account, and skips the old membership step', () => {
    expect(communityCallPath(full)).toEqual([
      'language',
      'calls',
      'native',
      'pageLanguage',
      'account',
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
      }),
    ).toEqual(['language', 'calls', 'native', 'account', 'waiting']);
  });

  it('skips account for someone who is already signed in', () => {
    expect(
      communityCallPath({
        includePageLanguage: false,
        includeAccount: false,
      }),
    ).toEqual(['language', 'calls', 'native', 'waiting']);
  });
});

describe('resolveCommunityCallStep', () => {
  const path = communityCallPath({
    includePageLanguage: false,
    includeAccount: false,
  });

  it('keeps a step that is still on the path', () => {
    expect(resolveCommunityCallStep('calls', path)).toBe('calls');
  });

  it('moves forward when the requested step was skipped', () => {
    expect(resolveCommunityCallStep('pageLanguage', path)).toBe('waiting');
    expect(resolveCommunityCallStep('account', path)).toBe('waiting');
    expect(resolveCommunityCallStep('membership', path)).toBe('waiting');
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
