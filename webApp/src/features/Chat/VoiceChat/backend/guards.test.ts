import { SPEAKING_CLUB_FOUNDER_UID } from '../types';
import {
  bumpSpeakingRate,
  escapeHtml,
  isAlexAccount,
  isAllowedPreviewUrl,
  messageForVisitor,
  normalizeAudioType,
  trustedDurationSec,
} from './guards';
import { RoomMessage } from '../types';

const message = (): RoomMessage => ({
  id: 'm1',
  roomId: 'room',
  kind: 'voice',
  senderId: 'maria',
  senderName: 'Maria',
  senderAvatarUrl: '',
  audioPath: 'speakingClubs/audio/room/messages/m1.webm',
  durationSec: 12,
  transcript: 'hello there',
  correctedTranscript: 'Hello there.',
  createdAtIso: '2026-10-17T12:00:00.000Z',
  likeCount: 2,
  likedByMe: true,
});

describe('voice chat guards', () => {
  it('trusts only the founder uid', () => {
    expect(isAlexAccount({ uid: SPEAKING_CLUB_FOUNDER_UID, email: 'other@example.com' })).toBe(
      true,
    );
    expect(isAlexAccount({ uid: 'someone-else', email: 'dmowski.alex@gmail.com' })).toBe(false);
  });

  it('hides the recording and the text from a visitor', () => {
    const preview = messageForVisitor(message());
    expect(preview.senderName).toBe('Maria');
    expect(preview.durationSec).toBe(12);
    expect(preview.likeCount).toBe(2);
    expect(preview.transcript).toBe('');
    expect(preview.correctedTranscript).toBe('');
    expect(preview.audioPath).toBe('');
    expect(preview.likedByMe).toBe(false);
  });

  it('escapes email html', () => {
    expect(escapeHtml(`<img src=x onerror="alert(1)">`)).toBe(
      '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;',
    );
  });

  it('allows only generated room pictures', () => {
    expect(
      isAllowedPreviewUrl(
        'https://storage.googleapis.com/dark-lang/publicImages/speaking-club-1.png',
      ),
    ).toBe(true);
    expect(isAllowedPreviewUrl('https://evil.example/publicImages/a.png)')).toBe(false);
    expect(isAllowedPreviewUrl('https://evil.example/track.png')).toBe(false);
    expect(isAllowedPreviewUrl('javascript:alert(1)')).toBe(false);
  });

  it('accepts browser audio types and rejects html', () => {
    expect(normalizeAudioType('audio/webm;codecs=opus')).toBe('audio/webm');
    expect(normalizeAudioType('')).toBe('audio/webm');
    expect(normalizeAudioType('text/html')).toBeNull();
  });

  it('replaces a one-second claim when the file is long', () => {
    expect(trustedDurationSec(1, 120_000)).toBe(20);
    expect(trustedDurationSec(12, 70_000)).toBe(12);
  });

  it('stops after a generous hour of messages', () => {
    const now = new Date('2026-10-17T18:00:00.000Z');
    let window = bumpSpeakingRate(null, 'message', now);
    expect(window).not.toBe('limited');
    if (window === 'limited') return;
    window = { ...window, hourMessages: 40 };
    expect(bumpSpeakingRate(window, 'message', now)).toBe('limited');
    expect(bumpSpeakingRate(window, 'intro', now)).not.toBe('limited');
  });
});
