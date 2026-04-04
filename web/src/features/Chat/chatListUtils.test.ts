import {
  calculateUnreadPersonalMessages,
  calculateDailyQuestionsNotifications,
} from './chatListUtils';
import { ChatSpaceUserReadMetadata, UserChatMetadata } from './type';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeChat(
  spaceId: string,
  allMessagesIds: Record<string, string> | null = null,
  allMessagesIdsAuthorsMap: Record<string, string> | null = null,
  overrides: Partial<UserChatMetadata> = {},
): UserChatMetadata {
  return {
    spaceId,
    allowedUserIds: null,
    isPrivate: false,
    type: 'privateChat',
    allMessagesIds,
    allMessagesIdsAuthorsMap,
    ...overrides,
  };
}

// ─── calculateUnreadPersonalMessages ───────────────────────────────────────────────────

describe('calculateUnreadPersonalMessages', () => {
  it('returns empty results when myChats is undefined', () => {
    const result = calculateUnreadPersonalMessages(undefined, undefined);
    expect(result).toEqual({ unreadSpaces: {}, myUnreadCount: 0 });
  });

  it('returns empty results when myChats is empty', () => {
    const result = calculateUnreadPersonalMessages([], undefined);
    expect(result).toEqual({ unreadSpaces: {}, myUnreadCount: 0 });
  });

  it('counts all messages as unread when read stats are absent', () => {
    const chats = [
      makeChat('space-1', { msg1: '2024-01-01T10:00:00Z', msg2: '2024-01-01T11:00:00Z' }),
    ];
    const result = calculateUnreadPersonalMessages(chats, undefined);
    expect(result.unreadSpaces).toEqual({ 'space-1': 2 });
    expect(result.myUnreadCount).toBe(2);
  });

  it('excludes messages that have been read', () => {
    const chats = [
      makeChat('space-1', { msg1: '2024-01-01T10:00:00Z', msg2: '2024-01-01T11:00:00Z' }),
    ];
    const readStats: ChatSpaceUserReadMetadata = { 'space-1': { msg1: true } };
    const result = calculateUnreadPersonalMessages(chats, readStats);
    expect(result.unreadSpaces).toEqual({ 'space-1': 1 });
    expect(result.myUnreadCount).toBe(1);
  });

  it('omits a space from unreadSpaces when all messages are read', () => {
    const chats = [makeChat('space-1', { msg1: '2024-01-01T10:00:00Z' })];
    const readStats: ChatSpaceUserReadMetadata = { 'space-1': { msg1: true } };
    const result = calculateUnreadPersonalMessages(chats, readStats);
    expect(result.unreadSpaces['space-1']).toBeUndefined();
    expect(result.myUnreadCount).toBe(0);
  });

  it('sums unread counts across multiple spaces', () => {
    const chats = [
      makeChat('space-1', { m1: '2024-01-01T10:00:00Z', m2: '2024-01-01T11:00:00Z' }),
      makeChat('space-2', { m3: '2024-01-01T09:00:00Z' }),
    ];
    const readStats: ChatSpaceUserReadMetadata = { 'space-1': { m1: true } };
    const result = calculateUnreadPersonalMessages(chats, readStats);
    expect(result.unreadSpaces).toEqual({ 'space-1': 1, 'space-2': 1 });
    expect(result.myUnreadCount).toBe(2);
  });

  it('treats a chat with null allMessagesIds as having zero messages', () => {
    const chats = [makeChat('space-1', null)];
    const result = calculateUnreadPersonalMessages(chats, undefined);
    expect(result.unreadSpaces).toEqual({});
    expect(result.myUnreadCount).toBe(0);
  });
});

// ─── calculateDailyQuestionsNotifications ───────────────────────────────────

describe('calculateDailyQuestionsNotifications', () => {
  const MY_UID = 'user-me';
  const OTHER_UID = 'user-other';

  it('returns empty results when dailyQuestionsChats is undefined', () => {
    const result = calculateDailyQuestionsNotifications(undefined, undefined, MY_UID, '');
    expect(result).toEqual({
      dailyQuestionsNotifications: [],
      totalDailyQuestionsUnreadMessagesCount: 0,
    });
  });

  it('returns empty results when dailyQuestionsChats is empty', () => {
    const result = calculateDailyQuestionsNotifications([], undefined, MY_UID, '');
    expect(result).toEqual({
      dailyQuestionsNotifications: [],
      totalDailyQuestionsUnreadMessagesCount: 0,
    });
  });

  it('includes all chats when prefix is empty string (English)', () => {
    const chats = [
      makeChat(
        'fr-daily-question-1',
        { m1: '2024-01-01T10:00:00Z', m2: '2024-01-01T11:00:00Z' },
        { m1: MY_UID, m2: OTHER_UID },
        { type: 'dailyQuestion' },
      ),
    ];
    // empty prefix matches every spaceId via startsWith('')
    const result = calculateDailyQuestionsNotifications(chats, undefined, MY_UID, '');
    expect(result.dailyQuestionsNotifications).toHaveLength(1);
  });

  it('skips a chat where the user has not sent any message', () => {
    const chats = [
      makeChat(
        'daily-question-1',
        { m1: '2024-01-01T10:00:00Z' },
        { m1: OTHER_UID },
        { type: 'dailyQuestion' },
      ),
    ];
    const result = calculateDailyQuestionsNotifications(chats, undefined, MY_UID, '');
    expect(result.dailyQuestionsNotifications).toHaveLength(0);
  });

  it('skips a chat where there are no other-user messages', () => {
    const chats = [
      makeChat(
        'daily-question-1',
        { m1: '2024-01-01T10:00:00Z' },
        { m1: MY_UID },
        { type: 'dailyQuestion' },
      ),
    ];
    const result = calculateDailyQuestionsNotifications(chats, undefined, MY_UID, '');
    expect(result.dailyQuestionsNotifications).toHaveLength(0);
  });

  it('reports unread replies after the user posted', () => {
    const chats = [
      makeChat(
        'daily-question-1',
        {
          m1: '2024-01-01T10:00:00Z', // my message
          m2: '2024-01-01T11:00:00Z', // reply from other
        },
        { m1: MY_UID, m2: OTHER_UID },
        { type: 'dailyQuestion' },
      ),
    ];
    const result = calculateDailyQuestionsNotifications(chats, undefined, MY_UID, '');
    expect(result.dailyQuestionsNotifications).toHaveLength(1);
    expect(result.dailyQuestionsNotifications[0]).toEqual({
      spaceId: 'daily-question-1',
      latestNotMineChanges: '2024-01-01T11:00:00Z',
      unreadCount: 1,
    });
    expect(result.totalDailyQuestionsUnreadMessagesCount).toBe(1);
  });

  it('marks replies as read when present in readStats', () => {
    const chats = [
      makeChat(
        'daily-question-1',
        {
          m1: '2024-01-01T10:00:00Z',
          m2: '2024-01-01T11:00:00Z',
        },
        { m1: MY_UID, m2: OTHER_UID },
        { type: 'dailyQuestion' },
      ),
    ];
    const readStats: ChatSpaceUserReadMetadata = { 'daily-question-1': { m2: true } };
    const result = calculateDailyQuestionsNotifications(chats, readStats, MY_UID, '');
    expect(result.dailyQuestionsNotifications[0].unreadCount).toBe(0);
    expect(result.totalDailyQuestionsUnreadMessagesCount).toBe(0);
  });

  it('accumulates totals across multiple daily chats', () => {
    const chats = [
      makeChat(
        'daily-question-1',
        { m1: '2024-01-01T10:00:00Z', m2: '2024-01-01T11:00:00Z' },
        { m1: MY_UID, m2: OTHER_UID },
        { type: 'dailyQuestion' },
      ),
      makeChat(
        'daily-question-2',
        { m3: '2024-01-02T10:00:00Z', m4: '2024-01-02T11:00:00Z' },
        { m3: MY_UID, m4: OTHER_UID },
        { type: 'dailyQuestion' },
      ),
    ];
    const result = calculateDailyQuestionsNotifications(chats, undefined, MY_UID, '');
    expect(result.dailyQuestionsNotifications).toHaveLength(2);
    expect(result.totalDailyQuestionsUnreadMessagesCount).toBe(2);
  });

  it('applies the language prefix filter correctly', () => {
    const chats = [
      makeChat(
        'fr-daily-question-1',
        { m1: '2024-01-01T10:00:00Z', m2: '2024-01-01T11:00:00Z' },
        { m1: MY_UID, m2: OTHER_UID },
        { type: 'dailyQuestion' },
      ),
      makeChat(
        'daily-question-1',
        { m3: '2024-01-01T10:00:00Z', m4: '2024-01-01T11:00:00Z' },
        { m3: MY_UID, m4: OTHER_UID },
        { type: 'dailyQuestion' },
      ),
    ];
    const result = calculateDailyQuestionsNotifications(chats, undefined, MY_UID, 'fr-');
    expect(result.dailyQuestionsNotifications).toHaveLength(1);
    expect(result.dailyQuestionsNotifications[0].spaceId).toBe('fr-daily-question-1');
  });

  it('picks the latest other-user message timestamp as latestNotMineChanges', () => {
    const chats = [
      makeChat(
        'daily-question-1',
        {
          m1: '2024-01-01T09:00:00Z', // other (earlier)
          m2: '2024-01-01T10:00:00Z', // mine
          m3: '2024-01-01T11:00:00Z', // other (later)
        },
        { m1: OTHER_UID, m2: MY_UID, m3: OTHER_UID },
        { type: 'dailyQuestion' },
      ),
    ];
    const result = calculateDailyQuestionsNotifications(chats, undefined, MY_UID, '');
    expect(result.dailyQuestionsNotifications[0].latestNotMineChanges).toBe('2024-01-01T11:00:00Z');
    expect(result.dailyQuestionsNotifications[0].unreadCount).toBe(2);
  });
});
