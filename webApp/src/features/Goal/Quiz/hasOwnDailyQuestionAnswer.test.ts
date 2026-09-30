import { hasOwnDailyQuestionAnswer } from './hasOwnDailyQuestionAnswer';

const message = (
  patch: Partial<{
    senderId: string;
    content: string;
    parentMessageId: string;
    isDeleted: boolean;
  }>,
) => ({
  senderId: 'user-1',
  content: 'My answer',
  parentMessageId: '',
  isDeleted: false,
  ...patch,
});

describe('hasOwnDailyQuestionAnswer', () => {
  it('is true when this user posted a top-level answer', () => {
    expect(hasOwnDailyQuestionAnswer([message({})], 'user-1')).toBe(true);
  });

  it('ignores other people, replies, deleted posts, and blank text', () => {
    expect(
      hasOwnDailyQuestionAnswer(
        [
          message({ senderId: 'someone-else' }),
          message({ parentMessageId: 'parent' }),
          message({ isDeleted: true }),
          message({ content: '   ' }),
        ],
        'user-1',
      ),
    ).toBe(false);
  });

  it('is false without a user id', () => {
    expect(hasOwnDailyQuestionAnswer([message({})], null)).toBe(false);
  });
});
