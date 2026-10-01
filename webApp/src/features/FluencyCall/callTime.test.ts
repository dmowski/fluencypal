import { FluencyCall } from './types';
import {
  buildCallRequestTelegramMessage,
  formatCallStartLabel,
  formatWarsawDateTime,
  buildMonthGrid,
  fromDatetimeLocalValue,
  getCallCountdown,
  isLocalDayBefore,
  isHttpUrl,
  isUpcomingCallInstant,
  localDateTimeToUtcIso,
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
    expect(message).toContain(formatWarsawDateTime(iso));
    expect(message).toContain(`UTC: ${iso}`);
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
