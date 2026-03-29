'use client';
import { createContext, useContext, ReactNode, JSX, useMemo } from 'react';
import { useAuth } from '../Auth/useAuth';
import { db } from '../Firebase/firebaseDb';
import { deleteDoc, query, where } from 'firebase/firestore';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { ChatSpaceUserReadMetadata, UserChatMetadata } from './type';
import { useSettings } from '../Settings/useSettings';
import { getDailyQuestionPrefix } from '../DailyQuestion/DailyQuestionFullCard';

// I send a message, and someone send a new message
interface MyDailyQuestionNotification {
  spaceId: string;
  latestNotMineChanges: string;
  unreadCount: number;
}

interface ChatListContextType {
  loading: boolean;
  myChats: UserChatMetadata[];
  myReadStats: ChatSpaceUserReadMetadata;
  unreadSpaces: Record<string, number>;
  myUnreadCount: number;
  deleteChat: (spaceId: string) => Promise<void>;
  totalDailyQuestionsUnreadMessagesCount: number;
  dailyQuestionsNotifications: MyDailyQuestionNotification[];
}

const ChatListContext = createContext<ChatListContextType | null>(null);

function useProvideChatList(): ChatListContextType {
  const auth = useAuth();
  const settings = useSettings();
  const userCreatedAt = settings.userCreatedAt;
  const chatListRef = db.collections.userChatList(auth.uid || '');

  const myReadStatsRef = db.documents.chatSpaceUserReadMetadata(auth.uid || '');
  const [myReadStatsData] = useDocumentData(myReadStatsRef);

  const myChatsQuery = useMemo(() => {
    if (chatListRef === null || !auth.uid) return null;
    return query(chatListRef, where('allowedUserIds', 'array-contains', auth.uid));
  }, [chatListRef, auth.uid]);

  const dailyQuestionsChatsQuery = useMemo(() => {
    if (!chatListRef) return null;
    return query(chatListRef, where('type', '==', 'dailyQuestion'));
  }, [chatListRef]);

  const [dailyQuestionsChats] = useCollectionData(dailyQuestionsChatsQuery);

  const [myChats, myChatsLoading, myChatsError] = useCollectionData(myChatsQuery);
  const [globalChat] = useDocumentData(db.documents.chat(auth.uid, 'global'));

  if (myChatsError) {
    console.error('Error fetching my chats:', myChatsError);
  }

  const {
    unreadSpaces,
    myUnreadCount,
    dailyQuestionsNotifications,
    totalDailyQuestionsUnreadMessagesCount,
  } = useMemo(() => {
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

        // last message first
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

    const dailyQuestionsNotifications: MyDailyQuestionNotification[] = [];

    let totalDailyQuestionsUnreadMessagesCount = 0;

    const dailyQuestionPrefix = getDailyQuestionPrefix(settings.languageCode || 'en');
    const cleanDailyQuestionsChats = dailyQuestionsChats?.filter((chat) =>
      chat.spaceId.startsWith(dailyQuestionPrefix),
    );

    cleanDailyQuestionsChats?.forEach((dailyChat) => {
      const spaceId = dailyChat.spaceId;
      // id: iso data
      const allMessagesObject = dailyChat.allMessagesIds || {};
      const allMessagesAuthorsMap = dailyChat.allMessagesIdsAuthorsMap || {};
      // old first
      const dailyChatMessagesIds = Object.keys(allMessagesObject).sort((a, b) => {
        const aIso = allMessagesObject[a] || '';
        const bIso = allMessagesObject[b] || '';
        return aIso.localeCompare(bIso);
      });

      const myMessageLastIndex = dailyChatMessagesIds.findLastIndex(
        (id) => allMessagesAuthorsMap[id] === auth.uid,
      );
      if (myMessageLastIndex === -1) {
        return;
      }

      const notMineMessages = dailyChatMessagesIds.filter((id, index) => {
        const authorId = allMessagesAuthorsMap[id];
        const isMine = authorId === auth.uid;
        return !isMine;
      });

      const latestNotMineChanges =
        allMessagesObject[notMineMessages[notMineMessages.length - 1]] || null;

      const unreadDailyRepliesCount = notMineMessages.filter((id) => {
        const isRead = myReadStatsData?.[spaceId]?.[id];
        return !isRead;
      }).length;

      if (latestNotMineChanges) {
        dailyQuestionsNotifications.push({
          spaceId,
          latestNotMineChanges,
          unreadCount: unreadDailyRepliesCount,
        });
        totalDailyQuestionsUnreadMessagesCount += unreadDailyRepliesCount;
      }
    });

    return {
      unreadSpaces: unreadLocalData,
      myUnreadCount: myUnreadCount,
      dailyQuestionsNotifications,
      totalDailyQuestionsUnreadMessagesCount,
    };
  }, [
    myChats,
    myReadStatsData,
    globalChat,
    userCreatedAt,
    dailyQuestionsChats,
    settings.languageCode,
  ]);

  const deleteChat = async (spaceId: string) => {
    const chatRef = db.documents.chat(auth.uid, spaceId);
    const isPublicChat = spaceId === 'global';

    if (isPublicChat) {
      console.warn('Cannot delete public global chat');
      return;
    }

    if (!chatRef) {
      return;
    }
    await deleteDoc(chatRef);
  };

  return {
    loading: myChatsLoading,
    myChats: myChats || [],
    myReadStats: myReadStatsData || {},
    totalDailyQuestionsUnreadMessagesCount,
    unreadSpaces,
    myUnreadCount,
    dailyQuestionsNotifications,
    deleteChat,
  };
}

export function ChatListProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvideChatList();

  return <ChatListContext.Provider value={hook}>{children}</ChatListContext.Provider>;
}

export const useChatList = (): ChatListContextType => {
  const context = useContext(ChatListContext);
  if (!context) {
    throw new Error('useChatList must be used within a UsageProvider');
  }
  return context;
};
