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

  return {
    conversation,
    conversationId,
    setConversationId,
    setConversation,
    newConversation,
    messageOrder,
    updateMessageOrder,
    resetMessageOrder: () => setMessageOrder({}),
  };
};
