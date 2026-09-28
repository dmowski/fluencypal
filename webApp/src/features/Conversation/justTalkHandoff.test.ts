/**
 * @jest-environment jsdom
 */
import { hasUserSpokenInConversation, isJustTalkHandoff } from './justTalkHandoff';

describe('justTalkHandoff', () => {
  it('treats open and true as a handoff', () => {
    expect(isJustTalkHandoff('open')).toBe(true);
    expect(isJustTalkHandoff('true')).toBe(true);
    expect(isJustTalkHandoff('')).toBe(false);
    expect(isJustTalkHandoff(null)).toBe(false);
  });

  it('counts a non-empty user message as spoken', () => {
    expect(hasUserSpokenInConversation([{ isBot: true, text: 'Hello' }])).toBe(false);
    expect(hasUserSpokenInConversation([{ isBot: false, text: '   ' }])).toBe(false);
    expect(
      hasUserSpokenInConversation([
        { isBot: true, text: 'Hello' },
        { isBot: false, text: 'Hi' },
      ]),
    ).toBe(true);
  });
});
