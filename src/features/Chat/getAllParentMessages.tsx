import { UserChatMessage } from './type';

export const getAllParentMessages = (
  message: UserChatMessage,
  messages: UserChatMessage[],
): UserChatMessage[] => {
  const parents: UserChatMessage[] = [];
  let currentMessage = message;

  while (currentMessage.parentMessageId) {
    const parent = messages.find((m) => m.id === currentMessage.parentMessageId);
    if (parent) {
      parents.unshift(parent);
      currentMessage = parent;
    } else {
      break;
    }
  }

  return parents;
};
