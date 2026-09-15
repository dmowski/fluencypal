import { ConversationMessage } from './conversation';

export const GUEST_CONVERSATION_USER_MESSAGE_LIMIT = 3;

export const countUserMessages = (
  conversation: Pick<ConversationMessage, 'isBot' | 'text'>[],
): number => conversation.filter((message) => !message.isBot && Boolean(message.text?.trim())).length;

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
  return countUserMessages(conversation) >= GUEST_CONVERSATION_USER_MESSAGE_LIMIT;
};
