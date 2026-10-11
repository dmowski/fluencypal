import { communityCallTelegramMessage, readCommunityCallRequest } from './communityCallRequest';

describe('communityCallRequest', () => {
  it('builds a telegram note from interests and contact', () => {
    expect(communityCallTelegramMessage('Travel, beginner', 'ada@example.com')).toBe(
      [
        'Group call request',
        '',
        'They want a free group call. Write them when you find people who fit, then pick a time that works for everyone.',
        'Interests: Travel, beginner',
        'Contact: ada@example.com',
      ].join('\n'),
    );
  });

  it('drops telegram markup and empty answers', () => {
    expect(
      readCommunityCallRequest({
        interests: '  *jobs*   and   travel  ',
        contact: ' @ada ',
      }),
    ).toEqual({
      interests: 'jobs and travel',
      contact: '@ada',
    });
    expect(readCommunityCallRequest({ interests: '   ', contact: 'ada@example.com' })).toEqual({
      error: 'Add what you want to talk about.',
    });
    expect(readCommunityCallRequest({ interests: 'travel', contact: '' })).toEqual({
      error: 'Add an email, Telegram, Instagram, or WhatsApp.',
    });
    expect(readCommunityCallRequest(null)).toEqual({
      error: 'Add your interests and a way to reach you.',
    });
  });
});
