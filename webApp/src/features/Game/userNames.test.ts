import { generateAvailableUsername, generateRandomUsername } from './userNames';

describe('generateAvailableUsername', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns a username when none are taken', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    expect(generateAvailableUsername([])).toBe(generateRandomUsername());
  });

  it('skips a name that is already taken, including different case and surrounding spaces', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const taken = generateRandomUsername();
    const next = generateAvailableUsername([`  ${taken.toLowerCase()}  `, '', null]);
    expect(next).toBe(`${taken}2`);
  });
});
