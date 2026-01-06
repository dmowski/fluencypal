"use client";
import { createContext, useContext, ReactNode, JSX, useMemo, useState, useEffect } from "react";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { useAuth } from "../Auth/useAuth";
import { db } from "../Firebase/firebaseDb";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { ChatLike, ChatLikeType, UserChatMessage } from "./type";
import { increaseGamePointsRequest } from "../Game/gameBackendRequests";
import { useUrlState } from "../Url/useUrlParam";

interface AddMessageProps {
  messageContent: string;
  parentMessageId: string;
}

interface ChatContextType {
  messages: UserChatMessage[];
  topLevelMessages: UserChatMessage[];
  messagesLikes: Record<string, ChatLike[]>;
  toggleLike: (messageId: string, type: ChatLikeType) => Promise<void>;

  commentsInfo: Record<string, number>;

  addMessage: ({ messageContent, parentMessageId }: AddMessageProps) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;

  unreadMessagesCount: number;
  markAsRead: () => void;

  loading: boolean;

  onCommentClick: (messageId: string) => void;
  activeCommentId: string;

  activeMessageId: string;
  onOpen: (messageId: string) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

const UNREAD_MESSAGES_LOCAL_STORAGE_KEY = "chat-last-read-timestamp";

function useProvideChat(): ChatContextType {
  const auth = useAuth();
  const userId = auth.uid || "anonymous";
  const messagesRef = db.collections.usersChatMessages();
  const [messagesData, loading] = useCollectionData(messagesRef);

  const [activeMessageIdComment, setActiveMessageIdComment] = useState("");
  const [activeMessageId, setActiveMessageId] = useUrlState("post", "", false);

  const { messages, topLevelMessages, commentsInfo } = useMemo<{
    messages: UserChatMessage[];
    topLevelMessages: UserChatMessage[];
    commentsInfo: Record<string, number>;
  }>(() => {
    const sortedMessages = messagesData
      ? [...messagesData].sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso))
      : [];

    const topLevel = sortedMessages.filter((msg) => {
      const isTopLevel = !msg.parentMessageId;
      if (isTopLevel) {
        return true;
      }

      const isParentChainIsBroken = !sortedMessages.find((m) => m.id === msg.parentMessageId);
      if (isParentChainIsBroken) {
        return true;
      }

      return !msg.parentMessageId;
    });

    const commentsMap: Record<string, number> = {};
    sortedMessages.forEach((msg) => {
      if (msg.parentMessageId) {
        if (!commentsMap[msg.parentMessageId]) {
          commentsMap[msg.parentMessageId] = 0;
        }
        commentsMap[msg.parentMessageId] += 1;
      }
    });

    return {
      messages: sortedMessages,
      topLevelMessages: topLevel,
      commentsInfo: commentsMap,
    };
  }, [messagesData]);

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

  const getUnreadMessagesCount = (chatMessageCount: number) => {
    const isWindow = typeof window !== "undefined";
    if (!isWindow) return 0;

    const readMessagesCount = localStorage.getItem(UNREAD_MESSAGES_LOCAL_STORAGE_KEY) || "0";

    return Math.max(0, chatMessageCount - Number(readMessagesCount));
  };

  const refreshUnreadMessagesCount = () => {
    const count = getUnreadMessagesCount(topLevelMessages.length);
    setUnreadMessagesCount(count);
  };

  useEffect(() => {
    refreshUnreadMessagesCount();
  }, [topLevelMessages.length]);

  const markAsRead = () => {
    const isWindow = typeof window !== "undefined";
    if (!isWindow) return;
    localStorage.setItem(UNREAD_MESSAGES_LOCAL_STORAGE_KEY, String(topLevelMessages.length));
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

  const addMessage = async ({ messageContent, parentMessageId }: AddMessageProps) => {
    const createdAtIso = new Date().toISOString();
    const newMessage: UserChatMessage = {
      id: `${Date.now()}`,
      senderId: userId,
      content: messageContent,
      createdAtIso: createdAtIso,
      createdAtUtc: Date.now(),
      updatedAtIso: createdAtIso,
      parentMessageId: parentMessageId,
    };
    const messageDoc = doc(messagesRef, newMessage.id);
    await setDoc(messageDoc, newMessage);

    const isDev = auth.userInfo?.email?.includes("dmowski");
    if (!isDev) {
      await increaseGamePointsRequest(
        {
          chatMessage: messageContent,
          chatUserId: auth.uid || "",
        },
        await auth.getToken()
      );
    } else {
      console.log("Do not add points for dev");
    }
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
    messages,
    topLevelMessages,
    messagesLikes,
    editMessage,

    unreadMessagesCount,
    markAsRead,
    commentsInfo,

    toggleLike,

    addMessage,
    deleteMessage,
    loading,

    activeCommentId: activeMessageIdComment,
    onCommentClick: (messageId: string) => setActiveMessageIdComment(messageId),

    activeMessageId,
    onOpen: (messageId: string) => setActiveMessageId(messageId),
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
