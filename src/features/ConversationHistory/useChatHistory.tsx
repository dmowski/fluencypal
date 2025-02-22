"use client";
import { createContext, useContext, ReactNode, JSX } from "react";
import { getDocs, limit, orderBy, query, setDoc, where } from "firebase/firestore";
import { useAuth } from "../Auth/useAuth";
import { SupportedLanguage } from "@/common/lang";
import { db } from "../Firebase/db";
import { ChatMessage, Conversation, ConversationMode } from "@/common/conversation";
import { useSettings } from "../Settings/useSettings";

interface ChatHistoryContextType {
  createConversation: (params: {
    conversationId: string;
    language: SupportedLanguage;
    mode: ConversationMode;
  }) => Promise<void>;
  setMessages: (conversationId: string, messages: ChatMessage[]) => Promise<void>;
  getLastConversations: (count: number) => Promise<Conversation[]>;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | null>(null);

function useProvideChatHistory(): ChatHistoryContextType {
  const auth = useAuth();
  const settings = useSettings();
  const userId = auth.uid;

  const getConversationDoc = (conversationId: string) => {
    const docRef = db.documents.conversation(userId, conversationId);
    if (!docRef) {
      throw new Error("❌ Conversation ID and userId are required");
    }
    return docRef;
  };

  const getLastConversations = async (count: number) => {
    const language = settings.language;
    if (!language) {
      throw new Error("❌ language is not defined | getLastConversations");
    }
    const collectionRef = db.collections.conversation(userId);
    if (!collectionRef) {
      throw new Error("❌ collectionRef is not defined | getLastConversations");
    }
    const queryRef = query(
      collectionRef,
      where("language", "==", language),
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
    language,
    mode,
  }: {
    conversationId: string;
    language: SupportedLanguage;
    mode: ConversationMode;
  }) => {
    const conversationDoc = getConversationDoc(conversationId);
    const conversationInfo: Conversation = {
      id: conversationId,
      messagesCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      language,
      mode,
    };

    await setDoc(conversationDoc, conversationInfo);
  };

  return {
    createConversation,
    getLastConversations,
    setMessages,
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
