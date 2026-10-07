import { groupCallTimeLabel, nextGroupCall } from './groupCallTimeLabel';

describe('groupCallTimeLabel', () => {
  const iso = '2027-06-03T17:00:00.000Z';

  it('names the local weekday and time', () => {
    expect(groupCallTimeLabel(iso, 'en-US', 'UTC', Date.parse('2027-06-01T00:00:00.000Z'))).toEqual(
      {
        weekday: 'THU',
        day: '3',
        time: '17:00',
        live: false,
        when: 'Thu 17:00',
      },
    );
  });

  it('picks the next call that has not started', () => {
    const past = { id: 'past', startsAtIso: '2020-01-01T00:00:00.000Z' };
    const next = { id: 'next', startsAtIso: '2027-06-03T17:00:00.000Z' };
    const later = { id: 'later', startsAtIso: '2027-06-04T18:30:00.000Z' };
    expect(nextGroupCall([past, next, later], Date.parse('2027-06-01T00:00:00.000Z'))).toBe(next);
    expect(nextGroupCall([past], Date.parse('2027-06-01T00:00:00.000Z'))).toBe(past);
    expect(nextGroupCall([], Date.parse('2027-06-01T00:00:00.000Z'))).toBeNull();
  });

  it('marks a call that has already started', () => {
    expect(
      groupCallTimeLabel(iso, 'en-US', 'UTC', Date.parse('2027-06-03T17:05:00.000Z')).live,
    ).toBe(true);
  });
});
