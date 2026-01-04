"use client";
import { createContext, useContext, ReactNode, JSX, useMemo, useState, useEffect } from "react";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { useAuth } from "../Auth/useAuth";
import { db } from "../Firebase/firebaseDb";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { ChatLike, ChatLikeType, UserChatMessage } from "./type";

interface ChatContextType {
  messages: UserChatMessage[];
  messagesLikes: Record<string, ChatLike[]>;
  toggleLike: (messageId: string, type: ChatLikeType) => Promise<void>;

  addMessage: (message: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;

  unreadMessagesCount: number;
  markAsRead: () => void;

  loading: boolean;
}

const ChatContext = createContext<ChatContextType | null>(null);

const UNREAD_MESSAGES_LOCAL_STORAGE_KEY = "chat-last-read-timestamp";

function useProvideChat(): ChatContextType {
  const auth = useAuth();
  const userId = auth.uid || "anonymous";
  const messagesRef = db.collections.usersChatMessages();
  const [messages, loading] = useCollectionData(messagesRef);

  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const likesRef = db.collections.usersChatLikes();
  const [likes] = useCollectionData(likesRef);

  const messagesLikes = useMemo(() => {
    const likesMap: Record<string, ChatLike[]> = {};
    if (likes) {
      likes.forEach((like) => {
        if (!likesMap[like.messageId]) {
          likesMap[like.messageId] = [];
        }
        likesMap[like.messageId].push(like);
      });
    }
    return likesMap;
  }, [likes]);

  const sortedMessages = useMemo(() => {
    return messages
      ? [...messages].sort((a, b) => a.createdAtIso.localeCompare(b.createdAtIso))
      : [];
  }, [messages]);

  const getUnreadMessagesCount = (chatMessageCount: number) => {
    const isWindow = typeof window !== "undefined";
    if (!isWindow) return 0;

    const readMessagesCount = localStorage.getItem(UNREAD_MESSAGES_LOCAL_STORAGE_KEY) || "0";

    return Math.max(0, chatMessageCount - Number(readMessagesCount));
  };

  const refreshUnreadMessagesCount = () => {
    const count = getUnreadMessagesCount(sortedMessages.length);
    setUnreadMessagesCount(count);
  };

  useEffect(() => {
    refreshUnreadMessagesCount();
  }, [sortedMessages.length]);

  const markAsRead = () => {
    const isWindow = typeof window !== "undefined";
    if (!isWindow) return;

    localStorage.setItem(UNREAD_MESSAGES_LOCAL_STORAGE_KEY, String(sortedMessages.length));
    setUnreadMessagesCount(0);
  };

  const toggleLike = async (messageId: string, type: ChatLikeType) => {
    const likeId = `${userId}-${messageId}`;
    const likeDoc = doc(likesRef, likeId);
    const isExistingLike = likes?.find(
      (like) => like.messageId === messageId && like.userId === userId
    );

    if (isExistingLike) {
      await deleteDoc(likeDoc);
      return;
    }

    const newLike: ChatLike = {
      messageId,
      userId,
      type,
      createdAtIso: new Date().toISOString(),
    };
    await setDoc(likeDoc, newLike);
  };

  const addMessage = async (messageContent: string) => {
    const newMessage: UserChatMessage = {
      id: `${userId}-${Date.now()}`,
      senderId: userId,
      content: messageContent,
      createdAtIso: new Date().toISOString(),
      createdAtUtc: Date.now(),
      updatedAtIso: new Date().toISOString(),
      replies: [],
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
    messagesLikes,
    editMessage,

    unreadMessagesCount,
    markAsRead,

    toggleLike,

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
