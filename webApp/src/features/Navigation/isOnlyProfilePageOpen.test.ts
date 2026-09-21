import { isOnlyProfilePageOpen } from './isOnlyProfilePageOpen';

describe('isOnlyProfilePageOpen', () => {
  it('is true when page=profile is the only query param', () => {
    expect(isOnlyProfilePageOpen('?page=profile')).toBe(true);
    expect(isOnlyProfilePageOpen('page=profile')).toBe(true);
  });

  it('is false when another window param is present', () => {
    expect(isOnlyProfilePageOpen('?page=profile&help=true')).toBe(false);
    expect(isOnlyProfilePageOpen('?page=profile&paymentHistory=true')).toBe(false);
  });

  it('is false on home or other pages', () => {
    expect(isOnlyProfilePageOpen('')).toBe(false);
    expect(isOnlyProfilePageOpen('?page=role-play')).toBe(false);
    expect(isOnlyProfilePageOpen('?page=community')).toBe(false);
  });
});
