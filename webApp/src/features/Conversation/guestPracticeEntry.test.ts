/**
 * @jest-environment jsdom
 */

import { canEnterPracticeAsGuest, isRolePlayGuestReady } from './guestPracticeEntry';
import { saveGuestReplyRecording } from '@/features/Auth/rolePlayGuestReplyStorage';

describe('guestPracticeEntry', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('allows Just Talk handoff without sign-in', () => {
    expect(canEnterPracticeAsGuest({ justTalk: 'open', rolePlayId: null })).toBe(true);
    expect(canEnterPracticeAsGuest({ justTalk: '', rolePlayId: null })).toBe(false);
  });

  it('allows roleplay after a guest reply is stored', () => {
    saveGuestReplyRecording({
      rolePlayId: 'hotel-check-in',
      blob: new Blob(['audio']),
      format: 'webm',
      durationSec: 3,
    });

    expect(isRolePlayGuestReady('hotel-check-in')).toBe(true);
    expect(canEnterPracticeAsGuest({ justTalk: '', rolePlayId: 'hotel-check-in' })).toBe(true);
  });
});
