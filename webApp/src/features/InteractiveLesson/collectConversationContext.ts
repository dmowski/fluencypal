import { Conversation } from '@/features/Conversation/conversation';
import { getSortedMessages } from '@/features/Conversation/getSortedMessages';
import { TARGET_CONTEXT_MESSAGES } from './constants';
import { ConversationContextMessage } from './types';

export const collectConversationContext = (
  conversations: Conversation[],
  targetCount = TARGET_CONTEXT_MESSAGES,
): { messages: ConversationContextMessage[]; messageCount: number; text: string } => {
  const collected: ConversationContextMessage[] = [];

  for (const conversation of conversations) {
    const remaining = targetCount - collected.length;
    if (remaining <= 0) break;

    const sorted = getSortedMessages({
      conversation: conversation.messages || [],
      messageOrder: conversation.messageOrder || {},
    });
    const slice = sorted.slice(-remaining);
    collected.push(
      ...slice.map((message) => ({
        isBot: !!message.isBot,
        text: message.text || '',
      })),
    );
  }

  const text = collected
    .map((message) => `${message.isBot ? 'AI' : 'Learner'}: ${message.text}`)
    .join('\n');

  return {
    messages: collected,
    messageCount: collected.length,
    text,
  };
};
