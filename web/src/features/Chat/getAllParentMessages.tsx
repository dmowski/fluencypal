import { ThreadsMessage } from './type';

export const getAllParentMessages = (
  message: ThreadsMessage,
  messages: ThreadsMessage[],
): ThreadsMessage[] => {
  const parents: ThreadsMessage[] = [];
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
