import { Conversation } from '@/common/conversation';

export function getConversationsStats(conversations: Conversation): {
  userWords: number;
  botWords: number;
} {
  let userWords = 0;
  let botWords = 0;

  conversations.messages.forEach((message) => {
    const wordCount = message.text.trim().split(/\s+/).length;
    if (!message.isBot) {
      userWords += wordCount;
    } else {
      botWords += wordCount;
    }
  });

  return { userWords, botWords };
}
