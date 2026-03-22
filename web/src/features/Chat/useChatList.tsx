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

  const dailyQuestionsChatsQuery = useMemo(() => {
    if (!chatListRef) return null;
    return query(chatListRef, where('type', '==', 'dailyQuestion'));
  }, [chatListRef]);

  const [dailyQuestionsChats, dailyQuestionsChatsLoading, dailyQuestionsChatsError] =
    useCollectionData(dailyQuestionsChatsQuery);

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
        const readMessagesCount = Object.keys(myReadStatsData?.[chat.spaceId] || {});
        const allMessages = Object.keys(chat.allMessagesIds || {});
        const unreadCount = allMessages.filter((id) => !readMessagesCount.includes(id)).length;
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

    /*
    // todo:
    // 1) get list of daily questions messages id
    // 2) Find my answer, and get messages after my last message in that space
    // 3) Filter only unread messages from that list, and add to unread count

    interface DailyUnreadMessages {
      spaceId: string;
      unreadCount: number;
      unreadMessagesIds: string[];
    }

    const dailyUnreadMessages: DailyUnreadMessages[] = [];

    dailyQuestionsChats?.forEach((dailyChat) => {
      const spaceId = dailyChat.spaceId;
      // id: iso data
      const allMessagesObject = dailyChat.allMessagesIds || {};
      // old first
      const dailyChatMessagesIds = Object.keys(allMessagesObject).sort((a, b) => {
        const aIso = allMessagesObject[a] || '';
        const bIso = allMessagesObject[b] || '';
        return aIso.localeCompare(bIso);
      });

      const isMyMessagesIncludes = dailyChatMessagesIds.filter((dailyMessageId) => {
        
      });

      console.log('dailyChatMessagesIds', spaceId, dailyChatMessagesIds);
    });
    */

    return {
      unreadSpaces: unreadLocalData,
      myUnreadCount: myUnreadCount,
      unreadCountGlobal,
    };
  }, [myChats, myReadStatsData, globalChat, userCreatedAt, dailyQuestionsChats]);

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
