import { buildNewsId, getNewsDayKey } from './buildNewsId';

describe('getNewsDayKey', () => {
  it('returns the UTC YYYY-MM-DD slice of an ISO timestamp', () => {
    expect(getNewsDayKey('2026-05-16T03:14:15.000Z')).toBe('2026-05-16');
    expect(getNewsDayKey('2026-05-16T23:59:59.999Z')).toBe('2026-05-16');
  });

  it('uses UTC even for offset-suffixed inputs', () => {
    // 2026-05-16T01:00:00+05:00 === 2026-05-15T20:00:00Z
    expect(getNewsDayKey('2026-05-16T01:00:00+05:00')).toBe('2026-05-15');
  });

  it('throws on invalid input', () => {
    expect(() => getNewsDayKey('not-a-date')).toThrow(/Invalid dateIso/);
  });
});

describe('buildNewsId', () => {
  const base = {
    countryCode: 'us',
    dateIso: '2026-05-16T12:00:00.000Z',
    sourceUrl: 'https://example.com/article-a',
  };

  it('is deterministic for the same inputs', () => {
    expect(buildNewsId(base)).toBe(buildNewsId(base));
  });

  it('is stable across the same UTC day regardless of time-of-day', () => {
    const morning = buildNewsId({ ...base, dateIso: '2026-05-16T00:30:00.000Z' });
    const evening = buildNewsId({ ...base, dateIso: '2026-05-16T22:45:00.000Z' });
    expect(morning).toBe(evening);
  });

  it('changes when the UTC day changes', () => {
    expect(buildNewsId({ ...base, dateIso: '2026-05-15T23:00:00.000Z' })).not.toBe(
      buildNewsId({ ...base, dateIso: '2026-05-16T01:00:00.000Z' }),
    );
  });

  it('normalises countryCode casing/whitespace', () => {
    expect(buildNewsId({ ...base, countryCode: 'US' })).toBe(
      buildNewsId({ ...base, countryCode: ' us ' }),
    );
  });

  it('differs across sourceUrl, countryCode, and day', () => {
    const a = buildNewsId(base);
    const b = buildNewsId({ ...base, sourceUrl: 'https://example.com/article-b' });
    const c = buildNewsId({ ...base, countryCode: 'gb' });
    expect(new Set([a, b, c]).size).toBe(3);
  });
});
