'use client';
import { createContext, useContext, ReactNode, JSX, useMemo } from 'react';
import { useAuth } from '../Auth/useAuth';
import { db } from '../Firebase/firebaseDb';
import { deleteDoc, query, where } from 'firebase/firestore';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { ChatSpaceUserReadMetadata, UserChatMetadata } from './type';
import { useSettings } from '../Settings/useSettings';
import { getDailyQuestionPrefix } from '../DailyQuestion/getDailyQuestionSpaceId';
import {
  calculateDailyQuestionsNotifications,
  MyDailyQuestionNotification,
  calculateUnreadPersonalMessages,
} from './chatListUtils';

interface ChatListContextType {
  loading: boolean;
  myChats: UserChatMetadata[];
  myReadStats: ChatSpaceUserReadMetadata;
  myUnreadCount: number;
  unreadGlobalChatCount: number;
  deleteChat: (spaceId: string) => Promise<void>;
  totalDailyQuestionsUnreadMessagesCount: number;
  dailyQuestionsNotifications: MyDailyQuestionNotification[];
}

const ChatListContext = createContext<ChatListContextType | null>(null);

function useProvideChatList(): ChatListContextType {
  const auth = useAuth();
  const settings = useSettings();
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

  if (myChatsError) {
    console.error('Error fetching my chats:', myChatsError);
  }

  const { myUnreadCount } = useMemo(
    () => calculateUnreadPersonalMessages(myChats, myReadStatsData),
    [myChats, myReadStatsData],
  );

  const { dailyQuestionsNotifications, totalDailyQuestionsUnreadMessagesCount } = useMemo(() => {
    const dailyQuestionPrefix = getDailyQuestionPrefix(settings.languageCode || 'en');
    return calculateDailyQuestionsNotifications(
      dailyQuestionsChats,
      myReadStatsData,
      auth.uid,
      dailyQuestionPrefix,
    );
  }, [dailyQuestionsChats, myReadStatsData, auth.uid, settings.languageCode]);

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
    myUnreadCount,
    unreadGlobalChatCount: 0,
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
