import { ThreadsMessage } from './type';

export const getAllChildrenMessages = (
  message: ThreadsMessage,
  messages: ThreadsMessage[],
): ThreadsMessage[] => {
  const children: ThreadsMessage[] = [];
  const stack: ThreadsMessage[] = [message];

  while (stack.length > 0) {
    const currentMessage = stack.pop();
    if (currentMessage) {
      const directChildren = messages.filter((m) => m.parentMessageId === currentMessage.id);
      children.push(...directChildren);
      stack.push(...directChildren);
    }
  }

  return children;
};
