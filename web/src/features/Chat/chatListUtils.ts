import { ChatSpaceUserReadMetadata, ThreadsMessage, UserChatMetadata } from './type';

export interface MyDailyQuestionNotification {
  spaceId: string;
  latestNotMineChanges: string;
  unreadCount: number;
}

export function calculateUnreadPersonalMessages(
  myChats: UserChatMetadata[] | undefined,
  myReadStatsData: ChatSpaceUserReadMetadata | undefined,
): { unreadSpaces: Record<string, number>; myUnreadCount: number } {
  const unreadLocalData: Record<string, number> = {};

  myChats
    ?.sort((a, b) => {
      const aAllMessagesTimes = Object.values(a.allMessagesIds || {}).sort((a, b) =>
        a.localeCompare(b),
      );
      const bAllMessagesTimes = Object.values(b.allMessagesIds || {}).sort((a, b) =>
        a.localeCompare(b),
      );

      const aLastMessageTime = aAllMessagesTimes[aAllMessagesTimes.length - 1] || '';
      const bLastMessageTime = bAllMessagesTimes[bAllMessagesTimes.length - 1] || '';

      return bLastMessageTime.localeCompare(aLastMessageTime);
    })
    .forEach((chat) => {
      const readMessagesCount = Object.keys(myReadStatsData?.[chat.spaceId] || {});
      const allMessages = Object.keys(chat.allMessagesIds || {});
      const unreadCount = allMessages.filter((id) => !readMessagesCount.includes(id)).length;
      if (unreadCount > 0) {
        unreadLocalData[chat.spaceId] = unreadCount;
      }
    });

  const myUnreadCount = Object.values(unreadLocalData).reduce((a, b) => a + b, 0);

  return { unreadSpaces: unreadLocalData, myUnreadCount };
}

export function calculateDailyQuestionsNotifications(
  dailyQuestionsChats: UserChatMetadata[] | undefined,
  myReadStatsData: ChatSpaceUserReadMetadata | undefined,
  myUid: string | null | undefined,
  dailyQuestionPrefix: string,
): {
  dailyQuestionsNotifications: MyDailyQuestionNotification[];
  totalDailyQuestionsUnreadMessagesCount: number;
} {
  const dailyQuestionsNotifications: MyDailyQuestionNotification[] = [];
  let totalDailyQuestionsUnreadMessagesCount = 0;

  const cleanDailyQuestionsChats = dailyQuestionsChats?.filter((chat) =>
    chat.spaceId.startsWith(dailyQuestionPrefix),
  );

  cleanDailyQuestionsChats?.forEach((dailyChat) => {
    const spaceId = dailyChat.spaceId;
    const allMessagesObject = dailyChat.allMessagesIds || {};
    const allMessagesAuthorsMap = dailyChat.allMessagesIdsAuthorsMap || {};

    // Sort message ids oldest-first by their ISO timestamp value
    const dailyChatMessagesIds = Object.keys(allMessagesObject).sort((a, b) => {
      const aIso = allMessagesObject[a] || '';
      const bIso = allMessagesObject[b] || '';
      return aIso.localeCompare(bIso);
    });

    const myMessageLastIndex = dailyChatMessagesIds.findLastIndex(
      (id) => allMessagesAuthorsMap[id] === myUid,
    );

    if (myMessageLastIndex === -1) {
      return;
    }

    const notMineMessages = dailyChatMessagesIds.filter(
      (id) => allMessagesAuthorsMap[id] !== myUid,
    );

    const latestNotMineChanges =
      allMessagesObject[notMineMessages[notMineMessages.length - 1]] || null;

    const unreadDailyReplies = notMineMessages.filter((id) => !myReadStatsData?.[spaceId]?.[id]);
    const unreadDailyRepliesCount = unreadDailyReplies.length;

    if (latestNotMineChanges) {
      dailyQuestionsNotifications.push({
        spaceId,
        latestNotMineChanges,
        unreadCount: unreadDailyRepliesCount,
      });
      totalDailyQuestionsUnreadMessagesCount += unreadDailyRepliesCount;
    }
  });

  return { dailyQuestionsNotifications, totalDailyQuestionsUnreadMessagesCount };
}

/**
 * Counts unread global-chat messages for a user, applying two filters:
 *  1. The message was created AFTER the user signed up.
 *  2. The message is either top-level (no parent) OR the user is a
 *     participant in its thread chain (i.e. the user has posted at least
 *     one message anywhere in the same chain).
 */
export function calculateGlobalChatUnreadCount(
  messages: ThreadsMessage[],
  globalReadStats: Record<string, boolean> | undefined,
  myUid: string | null | undefined,
  userCreatedAtIso: string | null | undefined,
): { topLevelUnreadCount: number; repliesUnreadCount: number } {
  if (!myUid || !userCreatedAtIso) return { topLevelUnreadCount: 0, repliesUnreadCount: 0 };
  // Build parent lookup: messageId -> parentMessageId (only for replies)
  const parentMap = new Map<string, string>();
  messages.forEach((m) => {
    if (m.parentMessageId) {
      parentMap.set(m.id, m.parentMessageId);
    }
  });

  // Resolve the root message of a chain (with memoization to avoid repeated traversals)
  const rootCache = new Map<string, string>();
  const getRoot = (id: string): string => {
    if (rootCache.has(id)) return rootCache.get(id)!;
    const parent = parentMap.get(id);
    const root = parent ? getRoot(parent) : id;
    rootCache.set(id, root);
    return root;
  };

  // Build map: rootId -> Set of sender UIDs (all participants in the chain)
  const chainParticipants = new Map<string, Set<string>>();
  messages.forEach((m) => {
    const rootId = getRoot(m.id);
    if (!chainParticipants.has(rootId)) {
      chainParticipants.set(rootId, new Set());
    }
    chainParticipants.get(rootId)!.add(m.senderId);
  });

  let topLevelUnreadCount = 0;
  let repliesUnreadCount = 0;
  for (const msg of messages) {
    if (msg.createdAtIso <= userCreatedAtIso) continue;
    if (globalReadStats?.[msg.id]) continue;

    const isTopLevel = !msg.parentMessageId;
    if (isTopLevel) {
      topLevelUnreadCount++;
    } else if (chainParticipants.get(getRoot(msg.id))?.has(myUid)) {
      repliesUnreadCount++;
    }
  }

  return { topLevelUnreadCount, repliesUnreadCount };
}
