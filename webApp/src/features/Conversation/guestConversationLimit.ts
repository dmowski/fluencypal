import { ConversationMessage } from './conversation';

/** Signed-in free users (no subscription) hit paywall after this many user messages. */
export const FREE_TIER_USER_MESSAGE_LIMIT = 10;

export const countUserMessages = (
  conversation: Pick<ConversationMessage, 'isBot' | 'text'>[],
): number => conversation.filter((message) => !message.isBot && Boolean(message.text?.trim())).length;

/**
 * Mid-call guest message limits were removed: anonymous users talk freely and
 * see the sign-in wall on Exit instead.
 */
export const isGuestConversationLimited = (_args: {
  isIdentified: boolean;
  conversation: Pick<ConversationMessage, 'isBot' | 'text'>[];
}): boolean => false;

export const isFreeTierUserMessageLimited = ({
  hasAccess,
  conversation,
}: {
  hasAccess: boolean;
  conversation: Pick<ConversationMessage, 'isBot' | 'text'>[];
}): boolean => {
  if (hasAccess) {
    return false;
  }
  return countUserMessages(conversation) >= FREE_TIER_USER_MESSAGE_LIMIT;
};
