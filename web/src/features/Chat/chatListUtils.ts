import { ChatSpaceUserReadMetadata, UserChatMetadata } from './type';

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
