export const getGlobalConversationId = (): string => {
  const isWindow = typeof window !== 'undefined';
  if (!isWindow) {
    return '';
  }
  // @ts-ignore
  const conversionId = window['__GLOBAL_CONVERSATION_ID__'];
  return conversionId || '';
};

export const setGlobalConversationId = (conversationId: string | null) => {
  const isWindow = typeof window !== 'undefined';
  if (!isWindow) {
    return;
  }
  // @ts-ignore
  window['__GLOBAL_CONVERSATION_ID__'] = conversationId || '';
};
