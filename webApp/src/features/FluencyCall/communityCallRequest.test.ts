import {
  communityCallTelegramMessage,
  readCommunityCallRequest,
  readCommunityCallUserId,
} from './communityCallRequest';

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

  it('reads the signed-in account and leaves guests unnamed', async () => {
    const readUser = jest.fn(async () => ({ uid: 'user-1' }));
    const signedIn = new Request('http://localhost/api/community-call/request', {
      headers: { Authorization: 'Bearer signed-in-token' },
    });
    const guest = new Request('http://localhost/api/community-call/request');

    await expect(readCommunityCallUserId(signedIn, readUser)).resolves.toBe('user-1');
    await expect(readCommunityCallUserId(guest, readUser)).resolves.toBeUndefined();
    expect(readUser).toHaveBeenCalledTimes(1);
  });

  it('keeps the request when the auth token cannot be read', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const readUser = jest.fn(async () => {
      throw new Error('Invalid token');
    });
    const request = new Request('http://localhost/api/community-call/request', {
      headers: { Authorization: 'Bearer stale-token' },
    });

    await expect(readCommunityCallUserId(request, readUser)).resolves.toBeUndefined();
    warn.mockRestore();
  });
});
