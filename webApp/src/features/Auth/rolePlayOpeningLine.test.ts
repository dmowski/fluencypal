import { getRolePlayOpeningLine } from './rolePlayOpeningLine';
import { RolePlayInstruction } from '@/features/RolePlay/types';

const aliasScenario = {
  id: 'alias-game',
  exampleOfFirstMessageFromAi:
    "Hello, I'm your AI partner for the Alias game. I'm ready to guess your word. Please describe it to me.",
  voice: 'shimmer',
} as RolePlayInstruction;

describe('getRolePlayOpeningLine', () => {
  it('returns the example first message and voice', () => {
    expect(getRolePlayOpeningLine(aliasScenario)).toEqual({
      text: aliasScenario.exampleOfFirstMessageFromAi,
      voice: 'shimmer',
      audioSrc: '/audio/role-openings/alias-game.mp3',
    });
  });

  it('returns null when the scenario has no opening line', () => {
    expect(
      getRolePlayOpeningLine({
        ...aliasScenario,
        exampleOfFirstMessageFromAi: '   ',
      }),
    ).toBeNull();
  });

  it('returns null without a scenario', () => {
    expect(getRolePlayOpeningLine(null)).toBeNull();
    expect(getRolePlayOpeningLine(undefined)).toBeNull();
  });
});
