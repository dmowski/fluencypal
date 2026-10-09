import { talkWithAlexTelegramMessage } from './talkWithAlexMessage';

describe('talkWithAlexTelegramMessage', () => {
  it('includes the contact and an optional note', () => {
    expect(talkWithAlexTelegramMessage('ada@example.com', 'I am a beginner')).toBe(
      [
        'Talk with Alex',
        '',
        'They want a short call to get to know each other.',
        'Contact: ada@example.com',
        'About them: I am a beginner',
      ].join('\n'),
    );
  });

  it('omits an empty note and strips Telegram markup', () => {
    expect(talkWithAlexTelegramMessage(' @alex_dm ', '  ')).toBe(
      [
        'Talk with Alex',
        '',
        'They want a short call to get to know each other.',
        'Contact: @alex dm',
      ].join('\n'),
    );
  });
});
