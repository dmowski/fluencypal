import { ChatMessage, MessagesOrderMap } from "@/common/conversation";

export const getSortedMessages = ({
  conversation,
  messageOrder,
}: {
  conversation: ChatMessage[];
  messageOrder: MessagesOrderMap;
}) => {
  // --- 1. Build sortedIds ---
  const sortedIds: string[] = [];

  if (!messageOrder || Object.keys(messageOrder).length === 0) {
    return conversation;
  }

  const parents = new Set(Object.keys(messageOrder));
  const children = new Set(Object.values(messageOrder));

  // Root = parent that is never a child
  const rootId = [...parents].find((id) => !children.has(id));

  if (!rootId) {
    // Fallback: return original order if chain is broken
    return conversation;
  }

  let currentId: string | undefined = rootId;

  while (currentId) {
    sortedIds.push(currentId);
    currentId = messageOrder[currentId];
  }

  // --- 2. Sort messages by sortedIds ---
  const orderIndex = new Map(sortedIds.map((id, index) => [id, index]));

  return [...conversation].sort((a, b) => {
    const aIndex = orderIndex.get(a.id);
    const bIndex = orderIndex.get(b.id);

    // both in chain
    if (aIndex !== undefined && bIndex !== undefined) {
      return aIndex - bIndex;
    }

    // only one in chain → chain comes first
    if (aIndex !== undefined) return -1;
    if (bIndex !== undefined) return 1;

    // neither in chain → keep original relative order
    return 0;
  });
};
