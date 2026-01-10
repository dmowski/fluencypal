"use client";
import { createContext, useContext, ReactNode, JSX, useMemo, useState, useEffect } from "react";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { useAuth } from "../Auth/useAuth";
import { db } from "../Firebase/firebaseDb";
import { useCollectionData, useDocumentData } from "react-firebase-hooks/firestore";
import {
  ChatLike,
  ChatLikeType,
  ChatSpaceUserReadMetadata,
  UserChatMessage,
  UserChatMetadata,
  UserChatMetadataStatic,
} from "./type";
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

  viewMessage: (message: UserChatMessage) => Promise<void>;

  unreadMessagesCount: number;
  markAsRead: (messageId: string) => void;

  loading: boolean;

  setActiveCommentMessageId: (messageId: string) => void;
  activeCommentMessageId: string;

  activeMessageId: string;
  onOpen: (messageId: string) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

const getIsCanRead = ({
  chatMetadata,
  userId,
}: {
  chatMetadata?: UserChatMetadata;
  userId: string;
}) => {
  return (
    chatMetadata &&
    userId &&
    (chatMetadata.isPrivate === false || chatMetadata.allowedUserIds?.includes(userId))
  );
};

function useProvideChat(propsChatMetadata: UserChatMetadataStatic): ChatContextType {
  const auth = useAuth();
  const userId = auth.uid;

  const metaRef = db.documents.chat(userId, propsChatMetadata.spaceId);
  const [metaData] = useDocumentData(metaRef);

  const isCanRead = getIsCanRead({ chatMetadata: metaData, userId });

  const messagesRef = isCanRead
    ? db.collections.usersChatMessages(propsChatMetadata.spaceId, userId)
    : null;
  const [messagesData, loading] = useCollectionData(messagesRef);

  const [activeCommentMessageId, setActiveCommentMessageId] = useState("");
  const [activeMessageId, setActiveMessageId] = useUrlState("post", "", false);

  const updateTotalMessages = () => {
    if (!metaData || !metaRef || !messagesData) return;
    const realTotalMessages = messagesData.length;
    if (metaData.totalMessages === realTotalMessages) return;

    const partialMetadata: Partial<UserChatMetadata> = { totalMessages: realTotalMessages };

    setDoc(metaRef, partialMetadata, { merge: true });
  };

  useEffect(() => {
    updateTotalMessages();
  }, [messagesData, metaData]);

  const initMetadataIfNeeded = async () => {
    if (metaData) {
      return messagesRef;
    }

    if (metaRef && userId) {
      console.log("Init metadata");
      await setDoc(metaRef, { ...propsChatMetadata, totalMessages: 0 });
    }

    const isCanReadAfterInit = getIsCanRead({
      chatMetadata: { ...propsChatMetadata, totalMessages: 0 },
      userId,
    });
    return isCanReadAfterInit
      ? db.collections.usersChatMessages(propsChatMetadata.spaceId, userId)
      : null;
  };

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

  const likesRef = isCanRead
    ? db.collections.usersChatLikes(propsChatMetadata.spaceId, userId)
    : null;
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

  const markAsRead = (messageId: string) => {
    const isWindow = typeof window !== "undefined";
    if (!isWindow) return;

    // settings.setReadChatMessages(topLevelMessages.length);
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
    const messagesRefInternal = await initMetadataIfNeeded();

    if (!messagesRefInternal || !userId) return;

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
    const messageDoc = doc(messagesRefInternal, newMessage.id);
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

    const isChildExisting = messages.find((m) => m.parentMessageId === messageId);
    if (isChildExisting) {
      const messageDoc = doc(messagesRef, messageId);
      const updatedMessage: Partial<UserChatMessage> = {
        content: "[deleted]",
        isDeleted: true,
        updatedAtIso: new Date().toISOString(),
      };
      await setDoc(messageDoc, updatedMessage, { merge: true });
    } else {
      const messageDoc = doc(messagesRef, messageId);
      await deleteDoc(messageDoc);
    }
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

  const myMetaRef = db.documents.chatSpaceUserReadMetadata(userId);
  const [myMetaDataSnap] = useDocumentData(myMetaRef);

  const viewMessage = async (message: UserChatMessage) => {
    if (!userId) return;

    if (myMetaRef) {
      const partialMyMeta: Partial<ChatSpaceUserReadMetadata> = {
        [propsChatMetadata.spaceId]: {
          [message.id]: true,
        },
      };
      const isAlreadyViewed = myMetaDataSnap?.[propsChatMetadata.spaceId]?.[message.id];
      if (!isAlreadyViewed) {
        await setDoc(myMetaRef, partialMyMeta, { merge: true });
      }
    }

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

  const readMessagesCount = Object.keys(myMetaDataSnap?.[propsChatMetadata.spaceId] || {}).length;
  const unreadMessagesCount = Math.max(0, (metaData?.totalMessages || 0) - readMessagesCount);

  return {
    messages,
    topLevelMessages,
    messagesLikes,
    editMessage,

    unreadMessagesCount: unreadMessagesCount,
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

export function ChatProvider({
  children,
  metadata,
}: {
  children: ReactNode;
  metadata: UserChatMetadataStatic;
}): JSX.Element {
  const chatHistoryData = useProvideChat(metadata);

  return <ChatContext.Provider value={chatHistoryData}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextType {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
