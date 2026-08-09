/** Total conversation messages required for 100% progress / task done. */
export const CONVERSATION_DONE_MESSAGE_COUNT = 10;

export function getConversationProgressPercent(messageCount: number): number {
  if (messageCount <= 0) return 0;
  return Math.min(100, Math.round((messageCount / CONVERSATION_DONE_MESSAGE_COUNT) * 100));
}

export function isConversationProgressComplete(messageCount: number): boolean {
  return messageCount >= CONVERSATION_DONE_MESSAGE_COUNT;
}
