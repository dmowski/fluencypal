import { hasUserSpokenInConversation } from './justTalkHandoff';
import { ConversationMessage } from './conversation';

export const isGuestConversationLimited = ({
  isIdentified,
  conversation,
}: {
  isIdentified: boolean;
  conversation: Pick<ConversationMessage, 'isBot' | 'text'>[];
}): boolean => {
  if (isIdentified) {
    return false;
  }
  return hasUserSpokenInConversation(conversation);
};
