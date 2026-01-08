"use client";
import { createContext, useContext, ReactNode, JSX, useMemo, useState, useEffect } from "react";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { useAuth } from "../Auth/useAuth";
import { db } from "../Firebase/firebaseDb";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { ChatLike, ChatLikeType, UserChatMessage } from "./type";
import { increaseGamePointsRequest } from "../Game/gameBackendRequests";
import { useUrlState } from "../Url/useUrlParam";
import { useSettings } from "../Settings/useSettings";

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

  viewMessage: (message: UserChatMessage) => Promise<void>;

  unreadMessagesCount: number;
  markAsRead: () => void;

  loading: boolean;

  setActiveCommentMessageId: (messageId: string) => void;
  activeCommentMessageId: string;

  activeMessageId: string;
  onOpen: (messageId: string) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

function useProvideChat(): ChatContextType {
  const auth = useAuth();
  const userId = auth.uid;
  const messagesRef = db.collections.usersChatMessages(userId);
  const [messagesData, loading] = useCollectionData(messagesRef);

  const [activeCommentMessageId, setActiveCommentMessageId] = useState("");
  const [activeMessageId, setActiveMessageId] = useUrlState("post", "", false);

  const settings = useSettings();

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

  const readChatMessages = settings.readChatMessages;
  const unreadMessagesCount = Math.max(0, topLevelMessages.length - readChatMessages);

  const likesRef = db.collections.usersChatLikes(userId);
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

  const markAsRead = () => {
    const isWindow = typeof window !== "undefined";
    if (!isWindow) return;

    settings.setReadChatMessages(topLevelMessages.length);
  };

  const toggleLike = async (messageId: string, type: ChatLikeType) => {
    if (!likesRef || !userId) return;
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
    if (!messagesRef || !userId) return;
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
    if (!messagesRef || !userId) return;
    const messageDoc = doc(messagesRef, messageId);
    await deleteDoc(messageDoc);
  };

  const editMessage = async (messageId: string, newContent: string) => {
    if (!messagesRef || !userId) return;
    const messageDoc = doc(messagesRef, messageId);
    const updatedMessage: Partial<UserChatMessage> = {
      content: newContent,
      updatedAtIso: new Date().toISOString(),
    };
    await setDoc(messageDoc, updatedMessage, { merge: true });
  };

  const viewMessage = async (message: UserChatMessage) => {
    if (!userId) return;
    const isAlreadyViewed = message.viewsUserIds ? message.viewsUserIds?.includes(userId) : false;
    if (isAlreadyViewed) return;
    if (!messagesRef) return;
    const messageToRead = messages.find((msg) => msg.id === message.id);
    if (!messageToRead) return;

    const updatedViewsUserIds = messageToRead.viewsUserIds
      ? [...messageToRead.viewsUserIds, userId]
      : [userId];
    const messageDoc = doc(messagesRef, message.id);
    await setDoc(messageDoc, { viewsUserIds: updatedViewsUserIds }, { merge: true });
  };

  return {
    messages,
    topLevelMessages,
    messagesLikes,
    editMessage,

    unreadMessagesCount,
    viewMessage,

    markAsRead,
    commentsInfo,

    toggleLike,

    addMessage,
    deleteMessage,
    loading,

    activeCommentMessageId,
    setActiveCommentMessageId,

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
