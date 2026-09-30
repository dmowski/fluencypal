export const hasOwnDailyQuestionAnswer = (
  messages: readonly {
    senderId: string;
    content: string;
    parentMessageId?: string;
    isDeleted?: boolean;
  }[],
  userId: string | null | undefined,
): boolean => {
  if (!userId) return false;
  return messages.some((message) => {
    if (message.senderId !== userId) return false;
    if (message.isDeleted) return false;
    if (message.parentMessageId) return false;
    return message.content.trim().length > 0;
  });
};
