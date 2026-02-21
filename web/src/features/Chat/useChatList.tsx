'use client';
import { createContext, useContext, ReactNode, JSX, useMemo } from 'react';
import { useAuth } from '../Auth/useAuth';
import { db } from '../Firebase/firebaseDb';
import { deleteDoc, query, where } from 'firebase/firestore';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { ChatSpaceUserReadMetadata, UserChatMetadata } from './type';
import { useSettings } from '../Settings/useSettings';

interface ChatListContextType {
  loading: boolean;
  myChats: UserChatMetadata[];
  myReadStats: ChatSpaceUserReadMetadata;
  unreadSpaces: Record<string, number>;
  myUnreadCount: number;
  unreadCountGlobal: number;
  deleteChat: (spaceId: string) => Promise<void>;
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
    const myUnreadCount = Object.values(unreadLocalData).reduce((a, b) => a + b, 0);

    const myGlobalReadMessagesIds = Object.keys(myReadStatsData?.['global'] || {});

    const globalTopLevelMessages = [...(globalChat?.totalTopLevelMessagesIds || [])];
    const myGlobalTopLevelMessages = globalTopLevelMessages.filter((id) => {
      if (!userCreatedAt) return false;
      const messageCreatedAtString = parseInt(id.split('-')?.[1] || id);
      return messageCreatedAtString >= userCreatedAt;
    });

    const unreadCountGlobal = myGlobalTopLevelMessages.filter(
      (id) => !myGlobalReadMessagesIds.includes(id),
    ).length;

    return {
      unreadSpaces: unreadLocalData,
      myUnreadCount: myUnreadCount,
      unreadCountGlobal,
    };
  }, [myChats, myReadStatsData, globalChat, userCreatedAt]);

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
    unreadSpaces,
    myUnreadCount,
    unreadCountGlobal,
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
