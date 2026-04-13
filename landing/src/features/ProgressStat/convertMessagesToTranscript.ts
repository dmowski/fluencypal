import { Conversation } from '../Conversation/conversation';
import { getSortedMessages } from '../Conversation/getSortedMessages';

export const convertMessagesToTranscript = (conversation: Conversation): string => {
  const sortedMessages = getSortedMessages({
    conversation: conversation.messages,
    messageOrder: conversation.messageOrder || {},
  });
  let transcript: string = '';
  sortedMessages.forEach((message) => {
    const isUser = message.isBot === false;
    const role = isUser ? 'Student' : 'Teacher';
    transcript += `${role}: ${message.text}\n`;
  });
  return transcript;
};
