import {
  calculateUnreadPersonalMessages,
  calculateDailyQuestionsNotifications,
  calculateGlobalChatUnreadCount,
} from './chatListUtils';
import { ChatSpaceUserReadMetadata, ThreadsMessage, UserChatMetadata } from './type';

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

// ─── calculateGlobalChatUnreadCount ─────────────────────────────────────────

describe('calculateGlobalChatUnreadCount', () => {
  const MY_UID = 'user-me';
  const OTHER_UID = 'user-other';

  // User signed up on 2024-01-01T00:00:00.000Z
  const USER_CREATED_AT_ISO = '2024-01-01T00:00:00.000Z';

  function makeMessage(
    id: string,
    senderId: string,
    createdAtIso: string,
    parentMessageId = '',
  ): ThreadsMessage {
    return {
      id,
      senderId,
      content: 'hello',
      parentMessageId,
      createdAtIso,
      createdAtUtc: new Date(createdAtIso).getTime(),
      updatedAtIso: createdAtIso,
      isReported: null,
    };
  }

  it('returns zeros when messages array is empty', () => {
    expect(calculateGlobalChatUnreadCount([], undefined, MY_UID, USER_CREATED_AT_ISO)).toEqual({
      topLevelUnreadCount: 0,
      repliesUnreadCount: 0,
    });
  });

  it('returns zeros when myUid is falsy', () => {
    const msgs = [makeMessage('m1', OTHER_UID, '2024-06-01T10:00:00Z')];
    expect(calculateGlobalChatUnreadCount(msgs, undefined, null, USER_CREATED_AT_ISO)).toEqual({
      topLevelUnreadCount: 0,
      repliesUnreadCount: 0,
    });
    expect(calculateGlobalChatUnreadCount(msgs, undefined, undefined, USER_CREATED_AT_ISO)).toEqual(
      { topLevelUnreadCount: 0, repliesUnreadCount: 0 },
    );
  });

  it('returns zeros when userCreatedAtMs is falsy', () => {
    const msgs = [makeMessage('m1', OTHER_UID, '2024-06-01T10:00:00Z')];
    expect(calculateGlobalChatUnreadCount(msgs, undefined, MY_UID, null)).toEqual({
      topLevelUnreadCount: 0,
      repliesUnreadCount: 0,
    });
    expect(calculateGlobalChatUnreadCount(msgs, undefined, MY_UID, undefined)).toEqual({
      topLevelUnreadCount: 0,
      repliesUnreadCount: 0,
    });
  });

  it('excludes messages created before or at sign-up time', () => {
    const msgs = [
      makeMessage('m1', OTHER_UID, '2023-12-31T23:59:59.999Z'), // before sign-up
      makeMessage('m2', OTHER_UID, '2024-01-01T00:00:00.000Z'), // exactly at sign-up (not after)
    ];
    expect(calculateGlobalChatUnreadCount(msgs, undefined, MY_UID, USER_CREATED_AT_ISO)).toEqual({
      topLevelUnreadCount: 0,
      repliesUnreadCount: 0,
    });
  });

  it('counts unread top-level messages created after sign-up', () => {
    const msgs = [
      makeMessage('m1', OTHER_UID, '2024-06-01T10:00:00Z'), // top-level, after sign-up
      makeMessage('m2', OTHER_UID, '2024-06-01T11:00:00Z'), // top-level, after sign-up
    ];
    const result = calculateGlobalChatUnreadCount(msgs, undefined, MY_UID, USER_CREATED_AT_ISO);
    expect(result.topLevelUnreadCount).toBe(2);
    expect(result.repliesUnreadCount).toBe(0);
  });

  it('does not count top-level messages already read', () => {
    const msgs = [
      makeMessage('m1', OTHER_UID, '2024-06-01T10:00:00Z'),
      makeMessage('m2', OTHER_UID, '2024-06-01T11:00:00Z'),
    ];
    const readStats = { m1: true };
    const result = calculateGlobalChatUnreadCount(msgs, readStats, MY_UID, USER_CREATED_AT_ISO);
    expect(result.topLevelUnreadCount).toBe(1);
    expect(result.repliesUnreadCount).toBe(0);
  });

  it('does not count a reply in a chain the user has not joined', () => {
    // m1 (top-level, by other), m2 (reply to m1, by other)
    // user has not posted in this chain → m2 is a reply and user not participant → skip m2
    const msgs = [
      makeMessage('m1', OTHER_UID, '2024-06-01T10:00:00Z'),
      makeMessage('m2', OTHER_UID, '2024-06-01T11:00:00Z', 'm1'),
    ];
    const result = calculateGlobalChatUnreadCount(msgs, undefined, MY_UID, USER_CREATED_AT_ISO);
    expect(result.topLevelUnreadCount).toBe(1);
    expect(result.repliesUnreadCount).toBe(0);
  });

  it('counts a reply in a chain where user is a participant', () => {
    // m1 (top-level, by me), m2 (reply to m1, by other)
    const msgs = [
      makeMessage('m1', MY_UID, '2024-06-01T10:00:00Z'),
      makeMessage('m2', OTHER_UID, '2024-06-01T11:00:00Z', 'm1'),
    ];
    const result = calculateGlobalChatUnreadCount(msgs, undefined, MY_UID, USER_CREATED_AT_ISO);
    expect(result.topLevelUnreadCount).toBe(1);
    expect(result.repliesUnreadCount).toBe(1);
  });

  it('counts deep replies in chains the user participated in', () => {
    // m1 (top, other) → m2 (reply, me) → m3 (reply to m2, other) → m4 (reply to m3, other)
    const msgs = [
      makeMessage('m1', OTHER_UID, '2024-06-01T10:00:00Z'),
      makeMessage('m2', MY_UID, '2024-06-01T11:00:00Z', 'm1'),
      makeMessage('m3', OTHER_UID, '2024-06-01T12:00:00Z', 'm2'),
      makeMessage('m4', OTHER_UID, '2024-06-01T13:00:00Z', 'm3'),
    ];
    const result = calculateGlobalChatUnreadCount(msgs, undefined, MY_UID, USER_CREATED_AT_ISO);
    expect(result.topLevelUnreadCount).toBe(1); // m1
    expect(result.repliesUnreadCount).toBe(3); // m2 (mine but still unread), m3, m4
  });

  it('does not count deep replies in chains the user has NOT participated in', () => {
    // chain: m1 (top, other) → m2 (other) → m3 (other)
    const msgs = [
      makeMessage('m1', OTHER_UID, '2024-06-01T10:00:00Z'),
      makeMessage('m2', OTHER_UID, '2024-06-01T11:00:00Z', 'm1'),
      makeMessage('m3', OTHER_UID, '2024-06-01T12:00:00Z', 'm2'),
    ];
    const result = calculateGlobalChatUnreadCount(msgs, undefined, MY_UID, USER_CREATED_AT_ISO);
    expect(result.topLevelUnreadCount).toBe(1);
    expect(result.repliesUnreadCount).toBe(0);
  });

  it('handles multiple independent chains correctly', () => {
    // chain A: m1 (top, me), m2 (reply, other)  → user in chain A
    // chain B: m3 (top, other), m4 (reply, other) → user NOT in chain B
    const msgs = [
      makeMessage('m1', MY_UID, '2024-06-01T10:00:00Z'),
      makeMessage('m2', OTHER_UID, '2024-06-01T11:00:00Z', 'm1'),
      makeMessage('m3', OTHER_UID, '2024-06-01T12:00:00Z'),
      makeMessage('m4', OTHER_UID, '2024-06-01T13:00:00Z', 'm3'),
    ];
    const result = calculateGlobalChatUnreadCount(msgs, undefined, MY_UID, USER_CREATED_AT_ISO);
    expect(result.topLevelUnreadCount).toBe(2); // m1, m3
    expect(result.repliesUnreadCount).toBe(1); // m2 (chain A, user participated)
  });

  it('excludes messages from a participated chain that were created before sign-up', () => {
    // m1 before sign-up (top, other), m2 after (reply, me), m3 after (reply, other, user in chain)
    const msgs = [
      makeMessage('m1', OTHER_UID, '2023-12-01T10:00:00Z'), // before sign-up
      makeMessage('m2', MY_UID, '2024-06-01T11:00:00Z', 'm1'),
      makeMessage('m3', OTHER_UID, '2024-06-01T12:00:00Z', 'm1'),
    ];
    const result = calculateGlobalChatUnreadCount(msgs, undefined, MY_UID, USER_CREATED_AT_ISO);
    expect(result.topLevelUnreadCount).toBe(0); // m1 excluded (before sign-up)
    expect(result.repliesUnreadCount).toBe(2); // m2 (mine, in chain), m3 (other, in chain)
  });
});
