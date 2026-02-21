import { sleep } from '@/libs/sleep';
import { useState, useRef, RefObject, useEffect } from 'react';
import { ConversationInstance } from '../ConversationInstance/types';
import { ConversationMessage, ConversationType } from '@/common/conversation';
import { useAuth } from '@/features/Auth/useAuth';

export const useRestart = (
  communicatorRef: RefObject<ConversationInstance | undefined>,
  toggleMute: (mute: boolean) => void,
  conversation: ConversationMessage[],
  currentMode: ConversationType,
) => {
  const auth = useAuth();
  const [isRestarting, setIsRestarting] = useState(false);
  const isRestartingRef = useRef(isRestarting);
  isRestartingRef.current = isRestarting;

  const restartConversation = async () => {
    if (isRestartingRef.current) {
      console.warn('Already restarting, skipping...');
      return;
    }
    isRestartingRef.current = true;
    // current instance of conversation will restarted

    toggleMute(true);
    await sleep(1000);
    setIsRestarting(true);

    await sleep(10_000);

    await communicatorRef.current?.restartConversation();
    const lastMessage = conversation?.[conversation.length - 1]?.text;
    await auth.sendTgMessage(
      `Restarting conversation. Last message before restart: ${lastMessage}`,
    );

    await sleep(500);

    setIsRestarting(false);

    setTimeout(() => {
      isRestartingRef.current = false;
    }, 40_000);
  };

  const messagesToRestart = auth.isFounder ? 40 : 130;
  const [isNeedToResetNow, setIsNeedToResetNow] = useState(false);

  useEffect(() => {
    if (isNeedToResetNow) {
      restartConversation();
      return;
    }
  }, [isNeedToResetNow]);

  useEffect(() => {
    const isModeForRestart = ['role-play', 'talk'].includes(currentMode);

    if (
      conversation.length > 0 &&
      conversation.length % messagesToRestart === 0 &&
      isModeForRestart
    ) {
      // To prevent memory leak in case of very long conversations
      restartConversation();
      return;
    }
  }, [conversation.length, messagesToRestart, currentMode]);

  return {
    setIsNeedToResetNow,
    isRestarting,
  };
};
