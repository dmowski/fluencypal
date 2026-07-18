'use client';
import { createContext, useContext, ReactNode, JSX, useCallback } from 'react';
import { getDocs, limit, orderBy, query, setDoc, startAfter, where } from 'firebase/firestore';
import { useAuth } from '../Auth/useAuth';
import { SupportedLanguage } from '@/features/Lang/lang';
import { db } from '../Firebase/firebaseDb';
import {
  ConversationMessage,
  Conversation,
  ConversationType,
  MessagesOrderMap,
} from '@/features/Conversation/conversation';
import { useSettings } from '../Settings/useSettings';

export const CONVERSATION_HISTORY_PAGE_SIZE = 10;

export interface ConversationsPage {
  conversations: Conversation[];
  hasMore: boolean;
  nextCursor: number | null;
}

interface ChatHistoryContextType {
  createConversation: (params: {
    conversationId: string;
    languageCode: SupportedLanguage;
    mode: ConversationType;
    rolePlayId: string | null;
  }) => Promise<void>;
  saveConversation: (
    conversationId: string,
    messages: ConversationMessage[],
    messageOrder: MessagesOrderMap,
  ) => Promise<void>;
  getLastConversations: (count: number) => Promise<Conversation[]>;
  getConversationsPage: (params: {
    pageSize?: number;
    cursor?: number | null;
  }) => Promise<ConversationsPage>;
  hasAnyConversation: () => Promise<boolean>;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | null>(null);

function useProvideChatHistory(): ChatHistoryContextType {
  const auth = useAuth();
  const settings = useSettings();
  const userId = auth.uid;
  const collectionRef = db.collections.conversation(userId);

  const getConversationDoc = (conversationId: string) => {
    const docRef = db.documents.conversation(userId, conversationId);
    if (!docRef) {
      throw new Error('❌ Conversation ID and userId are required');
    }
    return docRef;
  };

  const getLanguageScopedQuery = useCallback(
    (languageCode: SupportedLanguage) => {
      if (!collectionRef) {
        throw new Error('❌ collectionRef is not defined');
      }

      return query(
        collectionRef,
        where('languageCode', '==', languageCode),
        orderBy('updatedAt', 'desc'),
      );
    },
    [collectionRef],
  );

  const getLastConversations = async (count: number) => {
    const languageCode = settings.languageCode;
    if (!languageCode) {
      throw new Error('❌ languageCode is not defined | getLastConversations');
    }

    const queryRef = query(getLanguageScopedQuery(languageCode), limit(count));
    const snapshot = await getDocs(queryRef);
    return snapshot.docs.map((doc) => doc.data());
  };

  const getConversationsPage = async ({
    pageSize = CONVERSATION_HISTORY_PAGE_SIZE,
    cursor = null,
  }: {
    pageSize?: number;
    cursor?: number | null;
  }): Promise<ConversationsPage> => {
    const languageCode = settings.languageCode;
    if (!languageCode) {
      throw new Error('❌ languageCode is not defined | getConversationsPage');
    }

    const queryRef = cursor
      ? query(getLanguageScopedQuery(languageCode), startAfter(cursor), limit(pageSize + 1))
      : query(getLanguageScopedQuery(languageCode), limit(pageSize + 1));

    const snapshot = await getDocs(queryRef);
    const hasMore = snapshot.docs.length > pageSize;
    const conversations = snapshot.docs.slice(0, pageSize).map((doc) => doc.data());
    const nextCursor = conversations.at(-1)?.updatedAt ?? null;

    return {
      conversations,
      hasMore,
      nextCursor,
    };
  };

  const hasAnyConversation = async () => {
    if (!collectionRef) {
      throw new Error('❌ collectionRef is not defined | hasAnyConversation');
    }

    const snapshot = await getDocs(query(collectionRef, limit(1)));
    return !snapshot.empty;
  };

  const saveConversation = async (
    conversationId: string,
    messages: ConversationMessage[],
    messageOrder: MessagesOrderMap,
  ) => {
    const conversationDoc = getConversationDoc(conversationId);

    try {
      await setDoc(
        conversationDoc,
        {
          messages: messages || [],
          messagesCount: messages.length || 0,
          updatedAt: Date.now(),
          updatedAtIso: new Date().toISOString(),
          messageOrder: messageOrder || {},
        },
        { merge: true },
      );
    } catch (error) {
      console.error('Error saving conversation:', { conversationId, messages, messageOrder });
      throw error;
    }
  };

  const createConversation = async ({
    conversationId,
    languageCode,
    mode,
    rolePlayId,
  }: {
    conversationId: string;
    languageCode: SupportedLanguage;
    mode: ConversationType;
    rolePlayId: string | null;
  }) => {
    const conversationDoc = getConversationDoc(conversationId);
    const conversationInfo: Conversation = {
      id: conversationId,
      messagesCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      languageCode,
      messageOrder: {},
      createdAtIso: new Date().toISOString(),
      updatedAtIso: new Date().toISOString(),
      mode,
      rolePlayId,
    };

    await setDoc(conversationDoc, conversationInfo);
  };

  return {
    createConversation,
    getLastConversations,
    getConversationsPage,
    hasAnyConversation,
    saveConversation,
  };
}

export function ChatHistoryProvider({ children }: { children: ReactNode }): JSX.Element {
  const chatHistoryData = useProvideChatHistory();

  return (
    <ChatHistoryContext.Provider value={chatHistoryData}>{children}</ChatHistoryContext.Provider>
  );
}

export function useChatHistory(): ChatHistoryContextType {
  const context = useContext(ChatHistoryContext);
  if (!context) {
    throw new Error('useChatHistory must be used within a ChatHistoryProvider');
  }
  return context;
}
