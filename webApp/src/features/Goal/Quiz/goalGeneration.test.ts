import {
  claimGoalGeneration,
  releaseGoalGeneration,
  resetGoalGenerationClaims,
} from './goalGeneration';

describe('claimGoalGeneration', () => {
  beforeEach(() => {
    resetGoalGenerationClaims();
  });

  it('starts one generation for an about-you text and ignores the second call', () => {
    const about = 'I talk with clients at work.';
    const first = claimGoalGeneration(about, '');
    const second = claimGoalGeneration(about, '');

    expect(first).toEqual(expect.any(String));
    expect(second).toBeNull();
  });

  it('does not generate again after that plan is saved', () => {
    const about = 'I talk with clients at work.';
    const hash = claimGoalGeneration(about, '');
    releaseGoalGeneration(hash || '');

    expect(claimGoalGeneration(about, hash)).toBeNull();
  });

  it('generates again when the about-you text changes', () => {
    const first = claimGoalGeneration('I talk with clients.', '');
    const second = claimGoalGeneration('I want to pass an interview.', '');

    expect(first).toEqual(expect.any(String));
    expect(second).toEqual(expect.any(String));
    expect(second).not.toBe(first);
  });
});
