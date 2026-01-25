import { UserChatMessage } from './type';

export const getAllChildrenMessages = (
  message: UserChatMessage,
  messages: UserChatMessage[],
): UserChatMessage[] => {
  const children: UserChatMessage[] = [];
  const stack: UserChatMessage[] = [message];

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
