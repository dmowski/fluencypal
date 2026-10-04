import { canReadCommunityMessages } from './communityAccess';

describe('community message access', () => {
  const now = new Date('2026-10-04T12:00:00.000Z');
  const base = {
    canUseCommunity: true,
    isFullAccess: false,
    isGameWinner: false,
    groupConversationsUntilIso: null as string | null,
    now,
  };

  it('opens chats for an active Group conversations pass', () => {
    expect(
      canReadCommunityMessages({
        ...base,
        groupConversationsUntilIso: '2026-11-04T12:00:00.000Z',
      }),
    ).toBe(true);
  });

  it('keeps the paywall when the pass has ended', () => {
    expect(
      canReadCommunityMessages({
        ...base,
        groupConversationsUntilIso: '2026-10-01T12:00:00.000Z',
      }),
    ).toBe(false);
  });

  it('still blocks community when parental consent is required', () => {
    expect(
      canReadCommunityMessages({
        ...base,
        canUseCommunity: false,
        groupConversationsUntilIso: '2026-11-04T12:00:00.000Z',
      }),
    ).toBe(false);
  });
});
