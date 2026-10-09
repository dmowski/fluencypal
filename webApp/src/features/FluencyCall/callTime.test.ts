import { FluencyCall } from './types';
import { fluencyCallLanguageCode } from './callLanguage';
import {
  buildCallJoinTelegramMessage,
  buildCallRequestTelegramMessage,
  communityCallChosenTitle,
  fluencyCallRowTitle,
  formatCallStartLabel,
  formatCallLabel,
  timeZoneCity,
  formatWarsawDateTime,
  buildMonthGrid,
  fromDatetimeLocalValue,
  getCallCountdown,
  isLocalDayBefore,
  isHttpUrl,
  isUpcomingCallInstant,
  localDateTimeToUtcIso,
  selectListedCalls,
  selectVisibleCall,
  suggestedCallSlot,
  toDatetimeLocalValue,
} from './callTime';

const call = (
  overrides: Partial<FluencyCall> & Pick<FluencyCall, 'id' | 'startsAtIso'>,
): FluencyCall => ({
  link: 'https://meet.example.com/room',
  status: 'scheduled',
  createdAtIso: '2026-10-01T00:00:00.000Z',
  updatedAtIso: '2026-10-01T00:00:00.000Z',
  stoppedAtIso: null,
  ...overrides,
});

describe('communityCallChosenTitle', () => {
  it('names the chosen call with the weekday and local time', () => {
    expect(
      communityCallChosenTitle(
        '2026-10-17T21:00:00.000Z',
        new Date('2026-10-09T12:00:00.000Z'),
        'en-US',
        { today: 'Today', tomorrow: 'Tomorrow', now: 'Now' },
        'UTC',
      ),
    ).toBe('Saturday · 21:00');
  });
});

describe('formatCallStartLabel', () => {
  it('uses the full weekday in local time', () => {
    const iso = new Date(2026, 9, 3, 18, 0, 0, 0).toISOString();
    expect(formatCallStartLabel(iso)).toBe('Saturday, 3 Oct, 18:00');
  });
});

describe('getCallCountdown', () => {
  const now = new Date('2026-10-01T12:00:00.000Z');

  it('splits the wait into days, hours, and minutes', () => {
    expect(getCallCountdown('2026-10-02T16:03:00.000Z', now)).toEqual({
      days: 1,
      hours: 4,
      minutes: 3,
      seconds: 0,
      isLive: false,
    });
  });

  it('keeps a partial minute as not started yet', () => {
    expect(getCallCountdown('2026-10-01T12:00:30.000Z', now)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 30,
      isLive: false,
    });
  });

  it('treats the start time as live', () => {
    expect(getCallCountdown('2026-10-01T12:00:00.000Z', now)?.isLive).toBe(true);
    expect(getCallCountdown('2026-10-01T11:00:00.000Z', now)?.isLive).toBe(true);
  });

  it('returns null for an invalid time', () => {
    expect(getCallCountdown('not-a-date', now)).toBeNull();
  });
});

describe('selectListedCalls', () => {
  const now = new Date('2026-10-03T12:00:00.000Z');

  it('lists upcoming calls in start order and hides stopped ones', () => {
    const later = call({ id: 'later', startsAtIso: '2026-10-08T17:00:00.000Z' });
    const sooner = call({ id: 'sooner', startsAtIso: '2026-10-04T17:00:00.000Z' });
    const stopped = call({
      id: 'stopped',
      startsAtIso: '2026-10-06T16:00:00.000Z',
      status: 'stopped',
    });
    expect(selectListedCalls([later, stopped, sooner], now).map((item) => item.id)).toEqual([
      'sooner',
      'later',
    ]);
  });

  it('keeps a call that started recently and drops one from yesterday', () => {
    const recent = call({ id: 'recent', startsAtIso: '2026-10-03T11:00:00.000Z' });
    const stale = call({ id: 'stale', startsAtIso: '2026-10-02T20:00:00.000Z' });
    expect(selectListedCalls([stale, recent], now).map((item) => item.id)).toEqual(['recent']);
  });
});

describe('call labels in a timezone', () => {
  const words = { today: 'Today', tomorrow: 'Tomorrow', now: 'Now' };
  const warsaw = 'Europe/Warsaw';

  it('uses tomorrow and the clock in that zone', () => {
    const now = new Date('2026-10-03T16:00:00.000Z');
    const label = formatCallLabel('2026-10-04T17:00:00.000Z', now, 'en', warsaw);
    expect(label).toMatchObject({ month: 'OCT', day: '4', time: '19:00', relative: 'tomorrow' });
    expect(label && fluencyCallRowTitle(label, false, words)).toBe('Tomorrow · 19:00');
  });

  it('shifts the same instant for a viewer further west', () => {
    const now = new Date('2026-10-03T16:00:00.000Z');
    const label = formatCallLabel('2026-10-04T17:00:00.000Z', now, 'en', 'America/New_York');
    expect(label).toMatchObject({ month: 'OCT', day: '4', time: '13:00', relative: 'tomorrow' });
    expect(timeZoneCity('America/New_York')).toBe('New York');
  });

  it('calls the same local day today after UTC midnight', () => {
    const now = new Date('2026-10-03T22:30:00.000Z');
    const label = formatCallLabel('2026-10-04T17:00:00.000Z', now, 'en', warsaw);
    expect(label?.relative).toBe('today');
    expect(label && fluencyCallRowTitle(label, false, words)).toBe('Today · 19:00');
  });

  it('uses the weekday when the call is further out', () => {
    const now = new Date('2026-10-03T16:00:00.000Z');
    const label = formatCallLabel('2026-10-06T16:00:00.000Z', now, 'en', warsaw);
    expect(label).toMatchObject({ month: 'OCT', day: '6', time: '18:00', relative: 'weekday' });
    expect(label?.weekday).toBe('Tuesday');
  });

  it('drops the trailing dot from a short month name', () => {
    const now = new Date('2026-10-03T16:00:00.000Z');
    expect(formatCallLabel('2026-10-04T17:00:00.000Z', now, 'ru', warsaw)?.month).toBe('ОКТ');
    expect(formatCallLabel('2026-10-04T17:00:00.000Z', now, 'uk', warsaw)?.month).toBe('ЖОВТ');
    expect(formatCallLabel('2026-10-04T17:00:00.000Z', now, 'fr', warsaw)?.month).toBe('OCT');
  });

  it('uses a one-line month token for Vietnamese', () => {
    const now = new Date('2026-10-03T16:00:00.000Z');
    expect(formatCallLabel('2026-10-04T17:00:00.000Z', now, 'vi', warsaw)?.month).toBe('T10');
    expect(formatCallLabel('2026-10-04T17:00:00.000Z', now, 'vi-VN', warsaw)?.month).toBe('T10');
    expect(formatCallLabel('2026-01-15T12:00:00.000Z', now, 'vi', warsaw)?.month).toBe('T1');
  });

  it('labels a started call as now', () => {
    const now = new Date('2026-10-04T17:30:00.000Z');
    const label = formatCallLabel('2026-10-04T17:00:00.000Z', now, 'en', warsaw);
    expect(label && fluencyCallRowTitle(label, true, words)).toBe('Now · 19:00');
  });
});

describe('selectVisibleCall', () => {
  const now = new Date('2026-10-01T12:00:00.000Z');

  it('returns null when every call is stopped', () => {
    expect(
      selectVisibleCall(
        [call({ id: 'a', startsAtIso: '2026-10-02T12:00:00.000Z', status: 'stopped' })],
        now,
      ),
    ).toBeNull();
  });

  it('picks the earliest upcoming call', () => {
    const earlier = call({ id: 'early', startsAtIso: '2026-10-02T12:00:00.000Z' });
    const later = call({ id: 'late', startsAtIso: '2026-10-03T12:00:00.000Z' });
    expect(selectVisibleCall([later, earlier], now)?.id).toBe('early');
  });

  it('keeps the live call ahead of a later one', () => {
    const live = call({ id: 'live', startsAtIso: '2026-10-01T11:00:00.000Z' });
    const next = call({ id: 'next', startsAtIso: '2026-10-02T12:00:00.000Z' });
    expect(selectVisibleCall([next, live], now)?.id).toBe('live');
  });

  it('uses the most recently started live call', () => {
    const older = call({ id: 'older', startsAtIso: '2026-09-30T11:00:00.000Z' });
    const current = call({ id: 'current', startsAtIso: '2026-10-01T11:30:00.000Z' });
    expect(selectVisibleCall([older, current], now)?.id).toBe('current');
  });
});

describe('call time form values', () => {
  it('round-trips a local date through the datetime field', () => {
    const date = new Date(2026, 9, 3, 18, 30, 0, 0);
    const local = toDatetimeLocalValue(date.toISOString());
    expect(fromDatetimeLocalValue(local)).toBe(date.toISOString());
  });

  it('rejects empty and invalid local values', () => {
    expect(fromDatetimeLocalValue('')).toBeNull();
    expect(fromDatetimeLocalValue('nope')).toBeNull();
  });
});

describe('local time and UTC', () => {
  it('stores a local date and time as the same UTC instant', () => {
    const iso = localDateTimeToUtcIso('2026-10-03', '18:00');
    expect(iso).toBe(new Date(2026, 9, 3, 18, 0, 0, 0).toISOString());
    expect(iso?.endsWith('Z')).toBe(true);
    expect(toDatetimeLocalValue(iso || '')).toBe('2026-10-03T18:00');
  });

  it('rejects dates that do not exist', () => {
    expect(fromDatetimeLocalValue('2026-02-31T18:00')).toBeNull();
    expect(localDateTimeToUtcIso('2026-10-03', '25:00')).toBeNull();
  });

  it('rejects a time that has already passed', () => {
    const now = new Date('2026-10-03T16:00:00.000Z');
    expect(isUpcomingCallInstant('2026-10-03T15:00:00.000Z', now)).toBe(false);
    expect(isUpcomingCallInstant('2026-10-03T16:30:00.000Z', now)).toBe(true);
  });

  it('suggests tomorrow at 18:00 local', () => {
    const now = new Date(2026, 9, 1, 9, 15, 0, 0);
    expect(suggestedCallSlot(now)).toEqual({ date: '2026-10-02', time: '18:00' });
  });
});

describe('Warsaw time for the Telegram notice', () => {
  it('converts a summer UTC instant to Warsaw daylight time', () => {
    expect(formatWarsawDateTime('2026-10-03T16:00:00.000Z')).toMatch(/18:00/);
    expect(formatWarsawDateTime('2026-10-03T16:00:00.000Z')).toMatch(/Warsaw/);
    expect(formatWarsawDateTime('2026-10-03T16:00:00.000Z')).not.toMatch(/16:00/);
  });

  it('converts a winter UTC instant to Warsaw standard time', () => {
    expect(formatWarsawDateTime('2026-01-15T17:00:00.000Z')).toMatch(/18:00/);
    expect(formatWarsawDateTime('2026-01-15T17:00:00.000Z')).not.toMatch(/17:00/);
  });

  it('includes Warsaw time and the UTC instant in the notice', () => {
    const iso = '2026-10-03T16:00:00.000Z';
    const message = buildCallRequestTelegramMessage(iso);
    expect(message).toContain('FluencyPal call request');
    expect(message).toContain('Language: English');
    expect(message).toContain(formatWarsawDateTime(iso));
    expect(message).toContain(`UTC: ${iso}`);
  });

  it('names the practice language', () => {
    expect(buildCallRequestTelegramMessage('2026-10-03T16:00:00.000Z', 'es')).toContain(
      'Language: Spanish',
    );
  });

  it('includes Warsaw time when someone joins a call', () => {
    const iso = '2026-10-03T16:00:00.000Z';
    const message = buildCallJoinTelegramMessage(iso, 'es');
    expect(message).toContain("I'll join");
    expect(message).toContain('Language: Spanish');
    expect(message).toContain(formatWarsawDateTime(iso));
    expect(message).toContain(`UTC: ${iso}`);
  });
});

describe('call language', () => {
  it('treats a missing or unknown code as English', () => {
    expect(fluencyCallLanguageCode(undefined)).toBe('en');
    expect(fluencyCallLanguageCode('')).toBe('en');
    expect(fluencyCallLanguageCode('zz')).toBe('en');
  });

  it('keeps a language people can learn', () => {
    expect(fluencyCallLanguageCode('es')).toBe('es');
  });

  it('does not offer a language outside the practice list', () => {
    expect(fluencyCallLanguageCode('ru')).toBe('en');
    expect(fluencyCallLanguageCode('uk')).toBe('en');
  });
});

describe('month grid', () => {
  it('starts October 2026 on Thursday, with Monday as the first column', () => {
    const cells = buildMonthGrid(2026, 9);
    expect(cells.slice(0, 7)).toEqual([null, null, null, 1, 2, 3, 4]);
    expect(cells.filter((day) => day != null)).toHaveLength(31);
  });

  it('treats earlier calendar days as past', () => {
    const now = new Date(2026, 9, 3, 18, 0, 0, 0);
    expect(isLocalDayBefore('2026-10-02', now)).toBe(true);
    expect(isLocalDayBefore('2026-10-03', now)).toBe(false);
  });
});

describe('isHttpUrl', () => {
  it('accepts http and https links', () => {
    expect(isHttpUrl('https://meet.example.com/abc')).toBe(true);
    expect(isHttpUrl('http://localhost:3000/call')).toBe(true);
  });

  it('rejects other protocols and plain text', () => {
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isHttpUrl('meet.example.com')).toBe(false);
  });
});
