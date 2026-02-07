export const getConversationStarterMessagePrompt = (startMessage: string): string => {
  if (!startMessage) {
    return '';
  }
  return `## Conversation Start
Start the conversation with message like this: ${startMessage}.`;
};
