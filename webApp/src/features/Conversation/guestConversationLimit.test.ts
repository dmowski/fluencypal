import { isGuestConversationLimited } from './guestConversationLimit';

describe('isGuestConversationLimited', () => {
  it('lets identified users keep talking', () => {
    expect(
      isGuestConversationLimited({
        isIdentified: true,
        conversation: [{ isBot: false, text: 'Hello' }],
      }),
    ).toBe(false);
  });

  it('lets guests hear the greeting', () => {
    expect(
      isGuestConversationLimited({
        isIdentified: false,
        conversation: [{ isBot: true, text: 'Hi, tell me about yourself' }],
      }),
    ).toBe(false);
  });

  it('stops guests after the first spoken reply', () => {
    expect(
      isGuestConversationLimited({
        isIdentified: false,
        conversation: [
          { isBot: true, text: 'Hi' },
          { isBot: false, text: 'I want to speak English' },
        ],
      }),
    ).toBe(true);
  });
});
