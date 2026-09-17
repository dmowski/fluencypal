import {
  FREE_TIER_USER_MESSAGE_LIMIT,
  countUserMessages,
  isFreeTierUserMessageLimited,
  isGuestConversationLimited,
} from './guestConversationLimit';

describe('guestConversationLimit', () => {
  it('never mid-call limits guests (sign-in is on Exit)', () => {
    expect(
      isGuestConversationLimited({
        isIdentified: false,
        conversation: [
          { isBot: true, text: 'Hi' },
          { isBot: false, text: 'One' },
          { isBot: false, text: 'Two' },
          { isBot: false, text: 'Three' },
          { isBot: false, text: 'Four' },
        ],
      }),
    ).toBe(false);
  });

  it('counts non-empty user messages only', () => {
    expect(
      countUserMessages([
        { isBot: true, text: 'Hi' },
        { isBot: false, text: 'Hello' },
        { isBot: false, text: '   ' },
        { isBot: false, text: 'Second' },
      ]),
    ).toBe(2);
  });

  it(`limits free-tier users after ${FREE_TIER_USER_MESSAGE_LIMIT} user messages`, () => {
    const messages = Array.from({ length: FREE_TIER_USER_MESSAGE_LIMIT }, (_, i) => ({
      isBot: false as const,
      text: `Reply ${i + 1}`,
    }));
    expect(
      isFreeTierUserMessageLimited({
        hasAccess: false,
        conversation: messages,
      }),
    ).toBe(true);
    expect(
      isFreeTierUserMessageLimited({
        hasAccess: false,
        conversation: messages.slice(0, FREE_TIER_USER_MESSAGE_LIMIT - 1),
      }),
    ).toBe(false);
    expect(
      isFreeTierUserMessageLimited({
        hasAccess: true,
        conversation: messages,
      }),
    ).toBe(false);
  });
});
