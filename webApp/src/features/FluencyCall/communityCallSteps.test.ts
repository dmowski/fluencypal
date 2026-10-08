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
    expect(communityCallPath(full)).toEqual(['calls', 'native', 'pageLanguage', 'account']);
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
    ).toEqual(['calls', 'native', 'account']);
  });

  it('skips account for someone who is already signed in', () => {
    expect(
      communityCallPath({
        includePageLanguage: false,
        includeAccount: false,
      }),
    ).toEqual(['calls', 'native']);
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

  it('opens practice when the requested step is past the last one they still need', () => {
    expect(resolveCommunityCallStep('pageLanguage', path)).toBe('practice');
    expect(resolveCommunityCallStep('account', path)).toBe('practice');
    expect(resolveCommunityCallStep('membership', path)).toBe('practice');
    expect(resolveCommunityCallStep('waiting', path)).toBe('practice');
  });

  it('falls back to the first step for an unknown value', () => {
    expect(resolveCommunityCallStep('date', path)).toBe('calls');
  });

  it('sends an old language link to the calls list', () => {
    expect(resolveCommunityCallStep('language', path)).toBe('calls');
  });
});

describe('community call neighbours', () => {
  const path = communityCallPath(full);

  it('walks forward and back', () => {
    expect(nextCommunityCallStep('calls', path)).toBe('native');
    expect(previousCommunityCallStep('calls', path)).toBeNull();
    expect(nextCommunityCallStep('account', path)).toBeNull();
    expect(previousCommunityCallStep('native', path)).toBe('calls');
  });
});
