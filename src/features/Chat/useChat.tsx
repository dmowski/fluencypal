'use client';
import {
  createContext,
  useContext,
  ReactNode,
  JSX,
  useMemo,
  useState,
  useEffect,
  useRef,
} from 'react';
import { deleteDoc, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../Auth/useAuth';
import { db } from '../Firebase/firebaseDb';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import {
  ChatLike,
  ChatLikeType,
  ChatSpaceUserReadMetadata,
  ThreadsMessage,
  UserChatMetadata,
  UserChatMetadataStatic,
} from './type';
import { increaseGamePointsRequest } from '../Game/gameBackendRequests';
import { useUrlState } from '../Url/useUrlState';
import { sendFeedbackMessageRequest } from '@/app/api/telegram/sendFeedbackMessageRequest';
import dayjs from 'dayjs';
import { useTasks } from '../Tasks/useTasks';

interface AddMessageProps {
  messageContent: string;
  parentMessageId: string;
}

interface ChatContextType {
  messages: ThreadsMessage[];
  previewMessages: ThreadsMessage[];

  topLevelMessages: ThreadsMessage[];
  messagesLikes: Record<string, ChatLike[]>;
  toggleLike: (messageId: string, type: ChatLikeType) => Promise<void>;

  commentsInfo: Record<string, number>;

  addMessage: ({ messageContent, parentMessageId }: AddMessageProps) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;

  viewMessage: (message: ThreadsMessage) => Promise<void>;

  unreadMessagesCount: number;

  loading: boolean;

  setActiveCommentMessageId: (messageId: string) => void;
  activeCommentMessageId: string;

  activeMessageId: string;
  onOpen: (messageId: string) => void;
  getLastActivityOnMessage: (messageId: string) => string;
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

  const [activeCommentMessageId, setActiveCommentMessageId] = useState('');
  const [activeMessageId, setActiveMessageId] = useUrlState('post', '', true);

  const initMetadataIfNeeded = async () => {
    if (metaData) {
      return messagesRef;
    }

    if (metaRef && userId) {
      console.log('Init metadata');
      await setDoc(metaRef, {
        ...propsChatMetadata,
        totalMessages: 0,
        lastMessageAtIso: new Date().toISOString(),
        totalTopLevelMessagesIds: [],
        secondLevelSingleCommentsIds: [],
      });
    }

    const isCanReadAfterInit = getIsCanRead({
      chatMetadata: {
        ...propsChatMetadata,
        totalMessages: 0,
        lastMessageAtIso: new Date().toISOString(),
        totalTopLevelMessagesIds: [],
        secondLevelSingleCommentsIds: [],
      },
      userId,
    });
    return isCanReadAfterInit
      ? db.collections.usersChatMessages(propsChatMetadata.spaceId, userId)
      : null;
  };

  const getRandomMessages = (messages: ThreadsMessage[], count: number) => {
    const shuffled = [...messages].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const { messages, topLevelMessages, commentsInfo, secondLevelSingleCommentsIds } = useMemo<{
    messages: ThreadsMessage[];
    topLevelMessages: ThreadsMessage[];
    commentsInfo: Record<string, number>;
    secondLevelSingleCommentsIds: string[];
  }>(() => {
    const sortedMessages = messagesData
      ? [...messagesData].sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso))
      : [];

    const topLevel = sortedMessages.filter((msg) => {
      const isTopLevel = !msg.parentMessageId;
      return isTopLevel;
    });

    const topLevelIds = topLevel.map((msg) => msg.id);

    const topLevelMap: Record<string, string[]> = {};

    sortedMessages.forEach((msg) => {
      const isSecondLevel = msg.parentMessageId && topLevelIds.includes(msg.parentMessageId);
      if (!isSecondLevel) return;

      const topLevelBucket = topLevelMap[msg.parentMessageId];
      if (topLevelBucket) {
        topLevelBucket.push(msg.id);
      } else {
        topLevelMap[msg.parentMessageId] = [msg.id];
      }
    });

    const secondLevelSingleCommentsIds = Object.values(topLevelMap)
      .filter((ids) => ids.length === 1)
      .map((ids) => ids[0]);

    secondLevelSingleCommentsIds.map((id) => {
      const message = sortedMessages.find((msg) => msg.id === id);
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
      secondLevelSingleCommentsIds,
    };
  }, [messagesData]);

  useEffect(() => {
    updateTotalMessages();
  }, [messagesData, metaData]);

  const previewMessageCount = 5;
  const previewMessages = useMemo(() => {
    if (topLevelMessages.length <= previewMessageCount) return topLevelMessages;

    const latestMessage = topLevelMessages
      .slice()
      .sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso))[0];

    const otherMessages = topLevelMessages
      .filter((msg) => msg.id !== latestMessage.id)
      .filter((msg) => msg.senderId !== 'Mq2HfU3KrXTjNyOpPXqHSPg5izV2');

    return [latestMessage, ...getRandomMessages(otherMessages, previewMessageCount)];
  }, [topLevelMessages.length]);

  const updateTotalMessages = () => {
    if (!metaData || !metaRef || !messagesData) return;
    const realTotalMessages = messagesData.length;
    const totalTopLevelMessagesIds = topLevelMessages.map((msg) => msg.id);

    if (
      metaData.totalMessages === realTotalMessages &&
      (metaData?.totalTopLevelMessagesIds?.length || 0) === totalTopLevelMessagesIds.length &&
      secondLevelSingleCommentsIds.length === (metaData?.secondLevelSingleCommentsIds?.length || 0)
    ) {
      return;
    }

    const partialMetadata: Partial<UserChatMetadata> = {
      totalMessages: realTotalMessages,
      lastMessageAtIso: new Date().toISOString(),
      totalTopLevelMessagesIds: totalTopLevelMessagesIds,
      secondLevelSingleCommentsIds: secondLevelSingleCommentsIds,
    };

    setDoc(metaRef, partialMetadata, { merge: true });
  };

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

  const toggleLike = async (messageId: string, type: ChatLikeType) => {
    if (!likesRef || !userId) return;
    const likeId = `${userId}-${messageId}`;
    const likeDoc = doc(likesRef, likeId);
    const isExistingLike = likes?.find(
      (like) => like.messageId === messageId && like.userId === userId,
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

  const isSending = useRef<string>('');
  const tasks = useTasks();

  const addMessage = async ({ messageContent, parentMessageId }: AddMessageProps) => {
    if (isSending.current) {
      console.log('Already sending message:', isSending.current);
      return;
    }
    isSending.current = messageContent;

    const isDev = auth.userInfo?.email?.includes('dmowski');

    if (!isDev) {
      const url = `https://www.fluencypal.com/ru/practice?page=community`;
      sendFeedbackMessageRequest(
        {
          message: `💬 New message in ${propsChatMetadata.type} chat:\n\n${messageContent}\n\n${url}`,
        },
        await auth.getToken(),
      );
    }
    const messagesRefInternal = await initMetadataIfNeeded();

    if (!messagesRefInternal || !userId) {
      isSending.current = '';
      return;
    }

    const createdAtIso = new Date().toISOString();
    const newMessage: ThreadsMessage = {
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

    if (!isDev) {
      tasks.completeTask('chat');

      await increaseGamePointsRequest(
        {
          chatMessage: messageContent,
          chatUserId: auth.uid || '',
        },
        await auth.getToken(),
      );
    } else {
      console.log('Do not add points for dev');
    }

    isSending.current = '';
  };

  const deleteMessage = async (messageId: string) => {
    if (!messagesRef || !userId) return;

    const isChildExisting = messages.find((m) => m.parentMessageId === messageId);
    if (isChildExisting) {
      const messageDoc = doc(messagesRef, messageId);
      const updatedMessage: Partial<ThreadsMessage> = {
        content: '[deleted]',
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
    const updatedMessage: Partial<ThreadsMessage> = {
      content: newContent,
      updatedAtIso: new Date().toISOString(),
    };
    await setDoc(messageDoc, updatedMessage, { merge: true });
  };

  const myMetaRef = db.documents.chatSpaceUserReadMetadata(userId);
  const [myMetaDataSnap] = useDocumentData(myMetaRef);

  const viewMessage = async (message: ThreadsMessage) => {
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

  const getAllChildMessages = (messageId: string): ThreadsMessage[] => {
    const directChild = messages.filter((msg) => msg.parentMessageId === messageId);
    const allChild = [...directChild];
    directChild.forEach((childMsg) => {
      const childMessages = getAllChildMessages(childMsg.id);
      allChild.push(...childMessages);
    });
    return allChild;
  };

  const getLastActivityOnMessage = (messageId: string): string => {
    const message = messages.find((msg) => msg.id === messageId);
    if (!message) return dayjs().toISOString();
    const childMessages = getAllChildMessages(messageId);
    const dates = [message.updatedAtIso, ...childMessages.map((msg) => msg.updatedAtIso)];
    const recentDate = dates.sort((a, b) => b.localeCompare(a))[0];
    return recentDate;
  };

  const readMessagesCount = Object.keys(myMetaDataSnap?.[propsChatMetadata.spaceId] || {}).length;
  const unreadMessagesCount = Math.max(0, (metaData?.totalMessages || 0) - readMessagesCount);

  return {
    messages,
    previewMessages,
    getLastActivityOnMessage,
    topLevelMessages,
    messagesLikes,
    editMessage,
    unreadMessagesCount: unreadMessagesCount,
    viewMessage,
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
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
