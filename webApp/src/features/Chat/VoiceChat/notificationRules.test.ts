import {
  allowsSpeakingNotification,
  isQuietHours,
  parseSpeakingNotificationPrefs,
} from './notificationRules';
import { slugifyRoomTitle } from './slug';

describe('speaking club notification rules', () => {
  const prefs = parseSpeakingNotificationPrefs({
    browserEnabled: true,
    emailEnabled: true,
    inAppEnabled: true,
    newMessages: true,
    reviewJoiners: true,
    newRooms: false,
    sleepStart: '22:00',
    sleepEnd: '07:00',
    timezoneOffsetMinutes: 0,
  });

  it('keeps new rooms off unless someone turns them on', () => {
    expect(allowsSpeakingNotification({ prefs, transport: 'inApp', kind: 'newRooms' })).toBe(false);
    expect(
      allowsSpeakingNotification({
        prefs: { ...prefs, newRooms: true },
        transport: 'email',
        kind: 'newRooms',
        now: new Date('2026-01-01T12:00:00Z'),
      }),
    ).toBe(true);
  });

  it('lets a room turn a global choice off, not on', () => {
    expect(
      allowsSpeakingNotification({
        prefs,
        narrowing: {
          browserEnabled: false,
          emailEnabled: true,
          inAppEnabled: true,
          newMessages: true,
          reviewJoiners: true,
        },
        transport: 'browser',
        kind: 'newMessages',
        now: new Date('2026-01-01T12:00:00Z'),
      }),
    ).toBe(false);
    expect(
      allowsSpeakingNotification({
        prefs: { ...prefs, newMessages: false },
        narrowing: {
          browserEnabled: true,
          emailEnabled: true,
          inAppEnabled: true,
          newMessages: true,
          reviewJoiners: true,
        },
        transport: 'inApp',
        kind: 'newMessages',
      }),
    ).toBe(false);
  });

  it('stays quiet overnight for browser and email', () => {
    const night = new Date('2026-01-01T23:30:00Z');
    expect(isQuietHours(prefs, night)).toBe(true);
    expect(
      allowsSpeakingNotification({ prefs, transport: 'email', kind: 'newMessages', now: night }),
    ).toBe(false);
    expect(
      allowsSpeakingNotification({ prefs, transport: 'inApp', kind: 'newMessages', now: night }),
    ).toBe(true);
  });
});

describe('room slugs', () => {
  it('builds a short web address from the room name', () => {
    expect(slugifyRoomTitle('TV shows & YouTube')).toBe('tv-shows-youtube');
    expect(slugifyRoomTitle('   ')).toBe('room');
  });
});
