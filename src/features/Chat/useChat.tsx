"use client";
import { createContext, useContext, ReactNode, JSX, useMemo } from "react";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { useAuth } from "../Auth/useAuth";
import { db } from "../Firebase/firebaseDb";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { UserChatMessage } from "./type";

interface ChatContextType {
  messages: UserChatMessage[];
  addMessage: (message: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  loading: boolean;
}

const ChatContext = createContext<ChatContextType | null>(null);

function useProvideChat(): ChatContextType {
  const auth = useAuth();
  const userId = auth.uid || "anonymous";
  const messagesRef = db.collections.usersChatMessages();
  const [messages, loading] = useCollectionData(messagesRef);

  const sortedMessages = useMemo(() => {
    return messages ? [...messages].sort((a, b) => a.createdAtUtc - b.createdAtUtc) : [];
  }, [messages]);

  const addMessage = async (messageContent: string) => {
    const newMessage: UserChatMessage = {
      id: `${userId}-${Date.now()}`,
      senderId: userId,
      content: messageContent,
      createdAtIso: new Date().toISOString(),
      createdAtUtc: Date.now(),
      updatedAtIso: new Date().toISOString(),
    };
    const messageDoc = doc(messagesRef, newMessage.id);
    await setDoc(messageDoc, newMessage);
  };

  const deleteMessage = async (messageId: string) => {
    const messageDoc = doc(messagesRef, messageId);
    await deleteDoc(messageDoc);
  };

  const editMessage = async (messageId: string, newContent: string) => {
    const messageDoc = doc(messagesRef, messageId);
    const updatedMessage: Partial<UserChatMessage> = {
      content: newContent,
      updatedAtIso: new Date().toISOString(),
    };
    await setDoc(messageDoc, updatedMessage, { merge: true });
  };

  return {
    messages: sortedMessages,
    editMessage,

    addMessage,
    deleteMessage,
    loading,
  };
}

export function ChatProvider({ children }: { children: ReactNode }): JSX.Element {
  const chatHistoryData = useProvideChat();

  return <ChatContext.Provider value={chatHistoryData}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextType {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
