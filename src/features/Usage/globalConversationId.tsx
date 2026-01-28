export const getGlobalConversationId = (): string | null => {
  const isWindow = typeof window !== 'undefined';
  if (!isWindow) {
    return null;
  }
  // @ts-ignore
  const conversionId = window['__GLOBAL_CONVERSATION_ID__'];
  return conversionId || null;
};

export const setGlobalConversationId = (conversationId: string | null) => {
  const isWindow = typeof window !== 'undefined';
  if (!isWindow) {
    return;
  }
  // @ts-ignore
  window['__GLOBAL_CONVERSATION_ID__'] = conversationId || null;
};
