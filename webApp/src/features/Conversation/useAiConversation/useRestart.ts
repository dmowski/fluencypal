import { sleep } from '@/libs/sleep';
import { useState, useRef, RefObject, useEffect } from 'react';
import { ConversationInstance } from '../ConversationInstance/types';
import { ConversationMessage, ConversationType } from '@/features/Conversation/conversation';
import { useAuth } from '@/features/Auth/useAuth';
import {
  ConversationRestartReport,
  ConversationRestartTrigger,
  reportConversationRestart,
} from './reportConversationRestart';

export const useRestart = (
  communicatorRef: RefObject<ConversationInstance | undefined>,
  toggleMute: (mute: boolean) => void,
  conversation: ConversationMessage[],
  currentMode: ConversationType,
  conversationId: string | null,
) => {
  const auth = useAuth();
  const [isRestarting, setIsRestarting] = useState(false);
  const isRestartingRef = useRef(isRestarting);
  isRestartingRef.current = isRestarting;
  const messagesToRestart = auth.isFounder ? 40 : 130;
  const [isNeedToResetNow, setIsNeedToResetNow] = useState(false);

  const pendingRestartTriggerRef = useRef<ConversationRestartTrigger | null>(null);
  const pendingUsageSnapshotRef = useRef<
    ConversationRestartReport['usage'] | undefined
  >(undefined);

  const restartConversation = async (trigger: ConversationRestartTrigger) => {
    if (isRestartingRef.current) {
      console.warn('Already restarting, skipping...', { trigger });
      return;
    }
    isRestartingRef.current = true;

    const conversationLength = conversation.length;
    const lastMessage = conversation[conversationLength - 1]?.text;

    reportConversationRestart({
      trigger,
      conversationId,
      conversationLength,
      messagesToRestart,
      currentMode,
      lastMessagePreview: lastMessage?.slice(0, 200),
      usage: pendingUsageSnapshotRef.current,
    });
    pendingUsageSnapshotRef.current = undefined;

    toggleMute(true);
    await sleep(1000);
    setIsRestarting(true);

    await sleep(10_000);

    await communicatorRef.current?.restartConversation();
    await auth.sendTgMessage(
      `Restarting conversation (${trigger}). Last message before restart: ${lastMessage}`,
    );

    await sleep(500);

    setIsRestarting(false);
    setIsNeedToResetNow(false);

    setTimeout(() => {
      isRestartingRef.current = false;
    }, 40_000);
  };

  const requestRestart = (
    trigger: ConversationRestartTrigger,
    usage?: ConversationRestartReport['usage'],
  ) => {
    pendingRestartTriggerRef.current = trigger;
    pendingUsageSnapshotRef.current = usage;
    setIsNeedToResetNow(true);
  };

  useEffect(() => {
    if (!isNeedToResetNow || !pendingRestartTriggerRef.current) {
      return;
    }

    const trigger = pendingRestartTriggerRef.current;
    pendingRestartTriggerRef.current = null;
    void restartConversation(trigger);
  }, [isNeedToResetNow]);

  useEffect(() => {
    const isModeForRestart = ['role-play', 'talk'].includes(currentMode);

    if (
      conversation.length > 0 &&
      conversation.length % messagesToRestart === 0 &&
      isModeForRestart
    ) {
      // To prevent memory leak in case of very long conversations
      requestRestart('message_count_threshold');
      return;
    }
  }, [conversation.length, messagesToRestart, currentMode]);

  return {
    requestRestart,
    isRestarting,
  };
};
