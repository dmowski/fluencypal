import { VoiceChatMessage } from '../types';

export const collectSubtreeIds = (
  rootId: string,
  messages: VoiceChatMessage[],
): string[] => {
  const byParent = new Map<string, VoiceChatMessage[]>();
  for (const message of messages) {
    const key = message.parentMessageId || '';
    const list = byParent.get(key) || [];
    list.push(message);
    byParent.set(key, list);
  }

  const result: string[] = [];
  const walk = (id: string) => {
    result.push(id);
    const children = byParent.get(id) || [];
    for (const child of children) {
      walk(child.id);
    }
  };
  walk(rootId);
  return result;
};
