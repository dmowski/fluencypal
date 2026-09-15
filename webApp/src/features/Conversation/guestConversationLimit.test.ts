import {
  GUEST_CONVERSATION_USER_MESSAGE_LIMIT,
  isGuestConversationLimited,
} from './guestConversationLimit';

describe('isGuestConversationLimited', () => {
  it('lets identified users keep talking', () => {
    expect(
      isGuestConversationLimited({
        isIdentified: true,
        conversation: [
          { isBot: false, text: 'One' },
          { isBot: false, text: 'Two' },
          { isBot: false, text: 'Three' },
        ],
      }),
    ).toBe(false);
  });

  it('lets guests hear the greeting and send early replies', () => {
    expect(
      isGuestConversationLimited({
        isIdentified: false,
        conversation: [{ isBot: true, text: 'Hi, tell me about yourself' }],
      }),
    ).toBe(false);

    expect(
      isGuestConversationLimited({
        isIdentified: false,
        conversation: [
          { isBot: true, text: 'Hi' },
          { isBot: false, text: 'Hello' },
          { isBot: true, text: 'Nice' },
          { isBot: false, text: 'Second reply' },
        ],
      }),
    ).toBe(false);
  });

  it(`stops guests after ${GUEST_CONVERSATION_USER_MESSAGE_LIMIT} spoken replies`, () => {
    expect(
      isGuestConversationLimited({
        isIdentified: false,
        conversation: [
          { isBot: true, text: 'Hi' },
          { isBot: false, text: 'One' },
          { isBot: true, text: 'Ok' },
          { isBot: false, text: 'Two' },
          { isBot: true, text: 'Go on' },
          { isBot: false, text: 'Three' },
        ],
      }),
    ).toBe(true);
  });
});
