import { openAiLiveConversationPriceUsd } from './openAiLiveConversationPrice';

const liveConversation = (createdAt: number, updatedAt: number) => ({
  mode: 'open-ai-live' as const,
  createdAt,
  updatedAt,
  createdAtIso: new Date(createdAt).toISOString(),
  updatedAtIso: new Date(updatedAt).toISOString(),
});

describe('openAiLiveConversationPriceUsd', () => {
  it('prices a live conversation from start to end at the listed rate', () => {
    const start = Date.parse('2026-10-09T10:00:00.000Z');
    expect(openAiLiveConversationPriceUsd(liveConversation(start, start + 5 * 60_000))).toBe(0.25);
  });

  it('uses iso timestamps when the millis fields are missing', () => {
    expect(
      openAiLiveConversationPriceUsd({
        mode: 'open-ai-live',
        createdAt: 0,
        updatedAt: 0,
        createdAtIso: '2026-10-09T10:00:00.000Z',
        updatedAtIso: '2026-10-09T10:02:00.000Z',
      }),
    ).toBe(0.1);
  });

  it('leaves other conversation modes to token usage', () => {
    expect(
      openAiLiveConversationPriceUsd({
        ...liveConversation(1_000, 61_000),
        mode: 'talk',
      }),
    ).toBeNull();
  });
});
