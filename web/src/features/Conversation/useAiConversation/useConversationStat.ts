import { ConversationMessage, ConversationType } from '@/common/conversation';
import { useAiUserInfo } from '@/features/Ai/useAiUserInfo';
import { GoalElementInfo } from '@/features/Plan/types';
import { usePlan } from '@/features/Plan/usePlan';
import { useTasks } from '@/features/Tasks/useTasks';
import { useEffect } from 'react';

const modesToExtractUserInfo: ConversationType[] = ['talk', 'goal-talk'];

export const useConversationStat = (
  conversationId: string,
  conversation: ConversationMessage[],
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

    // todo: move to useAiConversationMessages
    const isNeedToSaveUserInfo = modesToExtractUserInfo.includes(currentMode);
    const messageCountToCheck = 5;
    if (
      isNeedToSaveUserInfo &&
      conversation.length >= 3 &&
      conversation.length % messageCountToCheck === 0
    ) {
      const lastMessagesToCheck = conversation.filter(
        (_, index, all) => index >= all.length - messageCountToCheck,
      );
      aiUserInfo.updateUserInfo(lastMessagesToCheck);
    }

    const usersMessagesCount = conversation.filter((message) => !message.isBot).length;
    if (usersMessagesCount === planMessageCount && goalInfo) {
      plan.increaseStartCount(goalInfo.goalPlan, goalInfo.goalElement);
    }
  }, [conversation.length]);
};
