import { createRscNPlusOneTracker, getRscRequestKey } from './rscNPlusOneDiagnostics';

describe('getRscRequestKey', () => {
  it('returns null for non-RSC URLs', () => {
    expect(getRscRequestKey('https://app.example.com/es/practice')).toBeNull();
  });

  it('normalizes pathname + _rsc hash', () => {
    expect(
      getRscRequestKey('https://app.example.com/es/practice?_rsc=0PNisv2QVcGnO9jn&foo=1'),
    ).toBe('https://app.example.com/es/practice?_rsc=0PNisv2QVcGnO9jn');
  });
});

describe('createRscNPlusOneTracker', () => {
  it('reports once when the same RSC key is fetched twice in the window', () => {
    const reports: Array<{ key: string; count: number }> = [];
    let now = 1_000;
    const tracker = createRscNPlusOneTracker({
      now: () => now,
      threshold: 2,
      windowMs: 2_000,
      onDuplicate: (payload) => reports.push({ key: payload.key, count: payload.count }),
    });

    const url = 'https://app.example.com/es/practice?_rsc=abc';
    tracker.track(url);
    expect(reports).toHaveLength(0);

    tracker.track(url);
    expect(reports).toEqual([
      { key: 'https://app.example.com/es/practice?_rsc=abc', count: 2 },
    ]);

    tracker.track(url);
    expect(reports).toHaveLength(1);
  });

  it('does not treat spaced-out fetches as duplicates', () => {
    const reports: unknown[] = [];
    let now = 1_000;
    const tracker = createRscNPlusOneTracker({
      now: () => now,
      threshold: 2,
      windowMs: 2_000,
      onDuplicate: (payload) => reports.push(payload),
    });

    const url = 'https://app.example.com/es/practice?_rsc=abc';
    tracker.track(url);
    now += 3_000;
    tracker.track(url);
    expect(reports).toHaveLength(0);
  });
});
