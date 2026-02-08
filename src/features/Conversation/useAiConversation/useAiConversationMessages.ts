import * as Sentry from '@sentry/nextjs';
import { ConversationMessage, MessagesOrderMap, ConversationType } from '@/common/conversation';
import { activateAnalyticUser, conversationStarted } from '@/features/Analytics/activationTracker';
import { useChatHistory } from '@/features/ConversationHistory/useChatHistory';
import { useSettings } from '@/features/Settings/useSettings';
import { setGlobalConversationId } from '@/features/Usage/globalConversationId';
import { useState, useRef, useEffect } from 'react';

export const useAiConversationMessages = () => {
  const history = useChatHistory();
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [conversationId, setConversationIdInternal] = useState<string | null>(null);

  const settings = useSettings();
  const [messageOrder, setMessageOrder] = useState<MessagesOrderMap>({});

  const setConversationId = (id: string | null) => {
    setConversationIdInternal(id);
    setGlobalConversationId(id);
  };

  const isStartedAnalyticLogged = useRef(false);

  // Analytics
  useEffect(() => {
    if (!conversationId || conversation.length === 0) return;
    activateAnalyticUser();
    if (conversation.length === 1 && conversationId && isStartedAnalyticLogged.current === false) {
      conversationStarted(conversationId);
      isStartedAnalyticLogged.current = true;
    }
  }, [conversation, conversationId]);

  // Sync with DB
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (conversation.length === 0 || !conversationId) return;
      history.saveConversation(conversationId, conversation, messageOrder);
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, [conversationId, conversation, messageOrder]);

  const newConversation = (mode: ConversationType) => {
    const newConversationId = `${Date.now()}`;
    setConversationId(newConversationId);
    isStartedAnalyticLogged.current = false;

    history.createConversation({
      conversationId: newConversationId,
      languageCode: settings.languageCode || 'en',
      mode: mode,
    });
    return newConversationId;
  };

  const updateMessageOrder = (orderPart: MessagesOrderMap) => {
    setMessageOrder((prev) => {
      return { ...prev, ...orderPart };
    });
  };

  const onAddDelta = (id: string, delta: string, isBot: boolean) => {
    setConversation((prev) => {
      let isNew = true;

      const newMessage = prev.map((message) => {
        if (message.id === id) {
          const oldText = message.text;
          isNew = false;
          return { ...message, text: oldText + delta };
        }
        return message;
      });

      if (isNew) {
        newMessage.push({ id, text: delta, isBot });
      }

      return newMessage;
    });
  };

  const onMessage = (
    message: ConversationMessage,
    {
      firstPotentialBotMessage,
    }: {
      firstPotentialBotMessage: string | null;
    },
  ) => {
    setConversation((prev) => {
      const isExisting = prev.find((m) => m.id === message.id);

      if (isExisting) {
        const isBot = message.isBot;
        if (isBot) {
          return [...prev.filter((m) => m.id !== message.id), message];
        }
        return prev.map((m) => (m.id === message.id ? message : m));
      }

      const isEmptyChat = prev.length === 0;
      const isEmptyNewMessage = message.text.trim() === '';
      const isErrorState = isEmptyChat && isEmptyNewMessage;
      if (isErrorState) {
        console.log('message', message);
        Sentry.captureException(new Error('Empty message from AI.'), {
          extra: {
            conversationId: conversationId,
            conversation: conversation,
          },
        });
      }

      return [
        ...prev,
        {
          ...message,
          text: isEmptyChat && isEmptyNewMessage ? firstPotentialBotMessage || '...' : message.text,
        },
      ];
    });
  };

  return {
    conversation,
    conversationId,
    setConversationId,
    setConversation,
    newConversation,
    messageOrder,
    updateMessageOrder,
    resetMessageOrder: () => setMessageOrder({}),
    onAddDelta,
    onMessage,
  };
};
