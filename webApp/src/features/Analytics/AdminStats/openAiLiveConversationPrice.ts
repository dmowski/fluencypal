import { Conversation } from '@/features/Conversation/conversation';
import { openAiLiveProviderCostUsdForElapsedMs } from '@/features/OpenAiLive/pricing';

const timestampMs = (millis: number | undefined, iso: string | undefined): number => {
  if (typeof millis === 'number' && Number.isFinite(millis) && millis > 0) return millis;
  const parsed = Date.parse(iso || '');
  return Number.isFinite(parsed) ? parsed : NaN;
};

export const openAiLiveConversationElapsedMs = (
  conversation: Pick<Conversation, 'createdAt' | 'updatedAt' | 'createdAtIso' | 'updatedAtIso'>,
): number => {
  const start = timestampMs(conversation.createdAt, conversation.createdAtIso);
  const end = timestampMs(conversation.updatedAt, conversation.updatedAtIso);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;
  return Math.max(0, end - start);
};

/** OpenAI cost for one live conversation, from its saved start and end. */
export const openAiLiveConversationPriceUsd = (
  conversation: Pick<
    Conversation,
    'mode' | 'createdAt' | 'updatedAt' | 'createdAtIso' | 'updatedAtIso'
  >,
): number | null => {
  if (conversation.mode !== 'open-ai-live') return null;
  return openAiLiveProviderCostUsdForElapsedMs(openAiLiveConversationElapsedMs(conversation));
};
