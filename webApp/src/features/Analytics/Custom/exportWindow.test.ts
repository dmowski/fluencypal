import {
  eventIsInWindow,
  nextExportFromLastReport,
  parseExportInstant,
  resolveExportWindow,
} from './exportWindow';

describe('exportWindow', () => {
  const now = new Date('2026-09-11T20:32:29.919Z');

  it('parses a UTC day and an ISO instant', () => {
    expect(parseExportInstant('2026-09-10', '--from')).toEqual({
      kind: 'day',
      dayKey: '2026-09-10',
      iso: '2026-09-10T00:00:00.000Z',
    });
    expect(parseExportInstant('2026-09-11T20:32:29Z', '--from')?.iso).toBe(
      '2026-09-11T20:32:29.000Z',
    );
  });

  it('defaults a missing window to today 00:00 through now', () => {
    expect(resolveExportWindow({ now })).toEqual({
      fromIso: '2026-09-11T00:00:00.000Z',
      toIso: '2026-09-11T20:32:29.919Z',
      fromDayKey: '2026-09-11',
      toDayKey: '2026-09-11',
      dayKey: '2026-09-11',
    });
  });

  it('exports one historical UTC day with --day', () => {
    expect(resolveExportWindow({ day: '2026-08-28', now })).toEqual({
      fromIso: '2026-08-28T00:00:00.000Z',
      toIso: '2026-08-28T23:59:59.999Z',
      fromDayKey: '2026-08-28',
      toDayKey: '2026-08-28',
      dayKey: '2026-08-28',
    });
  });

  it('starts at a timestamp and ends now', () => {
    expect(
      resolveExportWindow({
        from: '2026-09-10T18:00:00.000Z',
        now,
      }),
    ).toEqual({
      fromIso: '2026-09-10T18:00:00.000Z',
      toIso: '2026-09-11T20:32:29.919Z',
      fromDayKey: '2026-09-10',
      toDayKey: '2026-09-11',
      dayKey: '2026-09-10..2026-09-11',
    });
  });

  it('reads the next window from LAST_REPORT', () => {
    expect(nextExportFromLastReport('2026-09-11T20:32:29.919Z', now)).toEqual({
      from: '2026-09-11T20:32:29.919Z',
    });
    expect(nextExportFromLastReport('2026-09-10', now)).toEqual({
      from: '2026-09-11T00:00:00.000Z',
    });
    expect(nextExportFromLastReport('2026-09-11', now)).toEqual({
      from: '2026-09-11T00:00:00.000Z',
    });
  });

  it('filters events by createdAtIso when present', () => {
    expect(
      eventIsInWindow(
        { createdAtIso: '2026-09-11T20:32:29.919Z' },
        '2026-09-11T20:32:29.919Z',
        '2026-09-11T21:00:00.000Z',
        '2026-09-11',
        '2026-09-11',
      ),
    ).toBe(true);
    expect(
      eventIsInWindow(
        { createdAtIso: '2026-09-11T20:32:28.000Z', dayKey: '2026-09-11' },
        '2026-09-11T20:32:29.919Z',
        '2026-09-11T21:00:00.000Z',
        '2026-09-11',
        '2026-09-11',
      ),
    ).toBe(false);
  });
});
