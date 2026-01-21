'use client';
import { createContext, useContext, ReactNode, JSX, useMemo } from 'react';
import { useAuth } from '../Auth/useAuth';
import { db } from '../Firebase/firebaseDb';
import { query, where } from 'firebase/firestore';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { ChatSpaceUserReadMetadata, UserChatMetadata } from './type';

interface ChatListContextType {
  loading: boolean;
  myChats: UserChatMetadata[];
  myReadStats: ChatSpaceUserReadMetadata;
  unreadSpaces: Record<string, number>;
  myUnreadCount: number;
  unreadCountGlobal: number;
}

const ChatListContext = createContext<ChatListContextType | null>(null);

function useProvideChatList(): ChatListContextType {
  const auth = useAuth();
  const chatListRef = db.collections.userChatList(auth.uid || '');

  const myReadStatsRef = db.documents.chatSpaceUserReadMetadata(auth.uid || '');
  const [myReadStatsData] = useDocumentData(myReadStatsRef);

  const myChatsQuery = useMemo(() => {
    if (chatListRef === null || !auth.uid) return null;
    return query(chatListRef, where('allowedUserIds', 'array-contains', auth.uid));
  }, [chatListRef, auth.uid]);

  const [myChats, myChatsLoading, myChatsError] = useCollectionData(myChatsQuery);
  const [globalChat] = useDocumentData(db.documents.chat(auth.uid, 'global'));

  if (myChatsError) {
    console.error('Error fetching my chats:', myChatsError);
  }

  const { unreadSpaces, myUnreadCount, unreadCountGlobal } = useMemo(() => {
    const unreadLocalData: Record<string, number> = {};
    myChats
      ?.sort((a, b) => {
        const aTime = b.lastMessageAtIso || '';
        const bTime = a.lastMessageAtIso || '';

        // last message first
        return aTime.localeCompare(bTime);
      })
      .forEach((chat) => {
        const readMessagesCount = Object.keys(myReadStatsData?.[chat.spaceId] || {}).length;
        const totalMessagesCount = chat.totalMessages || 0;
        const unreadCount = Math.max(0, totalMessagesCount - readMessagesCount);
        if (unreadCount > 0) {
          unreadLocalData[chat.spaceId] = unreadCount;
        }
      });
    const unreadCount = Object.values(unreadLocalData).reduce((a, b) => a + b, 0);

    const readGlobalIds = Object.keys(myReadStatsData?.['global'] || {});
    const totalMessagesCountGlobal = [
      ...(globalChat?.totalTopLevelMessagesIds || []),
      ...(globalChat?.secondLevelSingleCommentsIds || []),
    ];
    const unreadCountGlobal = totalMessagesCountGlobal.filter(
      (id) => !readGlobalIds.includes(id),
    ).length;

    return {
      unreadSpaces: unreadLocalData,
      myUnreadCount: unreadCount,
      unreadCountGlobal,
    };
  }, [myChats, myReadStatsData, globalChat]);

  return {
    loading: myChatsLoading,
    myChats: myChats || [],
    myReadStats: myReadStatsData || {},
    unreadSpaces,
    myUnreadCount,
    unreadCountGlobal,
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
