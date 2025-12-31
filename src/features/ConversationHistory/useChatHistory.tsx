"use client";
import { createContext, useContext, ReactNode, JSX } from "react";
import { getDocs, limit, orderBy, query, setDoc, where } from "firebase/firestore";
import { useAuth } from "../Auth/useAuth";
import { SupportedLanguage } from "@/features/Lang/lang";
import { db } from "../Firebase/firebaseDb";
import { ChatMessage, Conversation, ConversationType } from "@/common/conversation";
import { useSettings } from "../Settings/useSettings";
import { useCollectionData } from "react-firebase-hooks/firestore";

interface ChatHistoryContextType {
  createConversation: (params: {
    conversationId: string;
    languageCode: SupportedLanguage;
    mode: ConversationType;
  }) => Promise<void>;
  setMessages: (conversationId: string, messages: ChatMessage[]) => Promise<void>;
  saveConversation: (conversationId: string, messages: ChatMessage[]) => Promise<void>;
  getLastConversations: (count: number) => Promise<Conversation[]>;
  conversations: Conversation[];
  loading: boolean;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | null>(null);

function useProvideChatHistory(): ChatHistoryContextType {
  const auth = useAuth();
  const settings = useSettings();
  const userId = auth.uid;
  const collectionRef = db.collections.conversation(userId);
  const [conversations, loading] = useCollectionData(collectionRef);

  const getConversationDoc = (conversationId: string) => {
    const docRef = db.documents.conversation(userId, conversationId);
    if (!docRef) {
      throw new Error("❌ Conversation ID and userId are required");
    }
    return docRef;
  };

  const getLastConversations = async (count: number) => {
    const languageCode = settings.languageCode;
    if (!languageCode) {
      throw new Error("❌ languageCode is not defined | getLastConversations");
    }

    if (!collectionRef) {
      throw new Error("❌ collectionRef is not defined | getLastConversations");
    }
    const queryRef = query(
      collectionRef,
      where("languageCode", "==", languageCode),
      orderBy("updatedAt", "desc"),
      limit(count)
    );
    const snapshot = await getDocs(queryRef);
    const data = snapshot.docs.map((doc) => doc.data());
    return data;
  };

  const setMessages = async (conversationId: string, messages: ChatMessage[]) => {
    const conversationDoc = getConversationDoc(conversationId);
    await setDoc(
      conversationDoc,
      {
        messages,
        messagesCount: messages.length,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  };

  const createConversation = async ({
    conversationId,
    languageCode,
    mode,
  }: {
    conversationId: string;
    languageCode: SupportedLanguage;
    mode: ConversationType;
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
      updatedAtIso: new Date().toISOString(),
      mode,
    };

    await setDoc(conversationDoc, conversationInfo);
  };

  const saveConversation = async (conversationId: string, messages: ChatMessage[]) => {
    const conversationDoc = getConversationDoc(conversationId);
    await setDoc(
      conversationDoc,
      {
        messages,
        messagesCount: messages.length,
        updatedAtIso: new Date().toISOString(),
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  };

  return {
    conversations: conversations || [],
    loading,
    createConversation,
    getLastConversations,
    setMessages,
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
    throw new Error("useChatHistory must be used within a ChatHistoryProvider");
  }
  return context;
}
