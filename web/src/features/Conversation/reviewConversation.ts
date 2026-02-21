import { ConversationMessage } from '@/common/conversation';

export const reviewConversation = async (chatHistory: ConversationMessage[]) => {
  const response = await fetch('/api/review-conversation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(chatHistory),
  });
  const data = await response.json();
  if (data.error) {
    console.log(data);
    throw new Error(data.error);
  }
  return data.output as string;
};
