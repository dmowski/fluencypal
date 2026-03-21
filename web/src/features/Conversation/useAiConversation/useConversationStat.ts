import {
  ConversationMessage,
  ConversationType,
  MessagesOrderMap,
} from '@/features/Conversation/conversation';
import { useAiUserInfo } from '@/features/User/useAiUserInfo';
import { GoalElementInfo } from '@/features/Plan/types';
import { usePlan } from '@/features/Plan/usePlan';
import { useTasks } from '@/features/Tasks/useTasks';
import { useEffect } from 'react';

const modesToExtractUserInfo: ConversationType[] = ['talk', 'goal-talk'];
const modesToNotExtractGrammar: ConversationType[] = ['grammar-improvement'];

export const useConversationStat = (
  conversationId: string,
  conversation: ConversationMessage[],
  messageOrder: MessagesOrderMap,
  currentMode: ConversationType,
  goalInfo: GoalElementInfo | null,
) => {
  const tasks = useTasks();
  const plan = usePlan();
  const aiUserInfo = useAiUserInfo();

  const planMessageCount = 10;

  useEffect(() => {
    if (!conversationId || conversation.length === 0) return;

    if (conversation.length === 2) {
      if (currentMode === 'words') {
        tasks.completeTask('words');
      } else if (currentMode === 'rule') {
        tasks.completeTask('rule');
      } else {
        tasks.completeTask('lesson');
      }
    }

    const isNeedToSaveUserInfo = modesToExtractUserInfo.includes(currentMode);
    const messageCountToCheck = 5;

    const isMessagesReadyToExtract =
      conversation.length >= 3 && conversation.length % messageCountToCheck === 0;

    const lastMessagesCount = messageCountToCheck + 5;
    if (isNeedToSaveUserInfo && isMessagesReadyToExtract) {
      aiUserInfo.extractAdvancedUserRecordsFromConversation({
        messages: conversation,
        messageOrder,
        lastMessagesCount,
        isNeedToCleanUpOldRecords: false,
        mode: 'user-info',
      });
    }

    if (isMessagesReadyToExtract && !modesToNotExtractGrammar.includes(currentMode)) {
      const isNeedToCleanUpOldGrammarFacts = conversation.length === messageCountToCheck;
      console.log('isNeedToCleanUpOldGrammarFacts', isNeedToCleanUpOldGrammarFacts);
      aiUserInfo.extractAdvancedUserRecordsFromConversation({
        messages: conversation,
        messageOrder,
        lastMessagesCount,
        isNeedToCleanUpOldRecords: isNeedToCleanUpOldGrammarFacts,
        mode: 'grammar',
      });
    }

    const usersMessagesCount = conversation.filter((message) => !message.isBot).length;
    if (usersMessagesCount === planMessageCount && goalInfo) {
      plan.increaseStartCount(goalInfo.goalPlan, goalInfo.goalElement);
    }
  }, [conversation.length]);
};
