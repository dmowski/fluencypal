'use client';

import { useCallback, useEffect, useRef } from 'react';
import { ConversationMessage } from '@/features/Conversation/conversation';
import { GuessGameStat } from '../types';
import { isAliasGameRolePlay, trackAliasEvent } from '@/features/RolePlay/aliasAnalytics';

interface UseAliasConversationAnalyticsParams {
  activeRolePlayId: string | null;
  gameStat: GuessGameStat | null;
  conversation: ConversationMessage[];
  isClosing: boolean;
}

export const useAliasConversationAnalytics = ({
  activeRolePlayId,
  gameStat,
  conversation,
  isClosing,
}: UseAliasConversationAnalyticsParams) => {
  const hasTrackedAiGuess = useRef(false);
  const hasTrackedRoundCompleted = useRef(false);

  const resetAliasAnalytics = useCallback(() => {
    hasTrackedAiGuess.current = false;
    hasTrackedRoundCompleted.current = false;
  }, []);

  useEffect(() => {
    if (!isAliasGameRolePlay(activeRolePlayId) || !gameStat) return;

    const userMessages = conversation.filter(
      (message) => !message.isBot && message.text.trim().length > 0,
    );
    const botMessages = conversation.filter(
      (message) => message.isBot && message.text.trim().length > 0,
    );

    if (!hasTrackedAiGuess.current && userMessages.length > 0 && botMessages.length >= 2) {
      trackAliasEvent('alias_ai_guess_received');
      hasTrackedAiGuess.current = true;
    }
  }, [activeRolePlayId, conversation, gameStat]);

  useEffect(() => {
    if (!hasTrackedRoundCompleted.current && isClosing && isAliasGameRolePlay(activeRolePlayId)) {
      trackAliasEvent('alias_round_completed');
      hasTrackedRoundCompleted.current = true;
    }
  }, [activeRolePlayId, isClosing]);

  return { resetAliasAnalytics };
};
