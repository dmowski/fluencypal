export const getConversationStarterMessagePrompt = (startMessage: string): string => {
  if (!startMessage) {
    return '';
  }
  return `## Conversation Start
You can start the conversation with a topic like this: ${startMessage}.
Start the conversation at a slow pace of voice. 
`;
};
