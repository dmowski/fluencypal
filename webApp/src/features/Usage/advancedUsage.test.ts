import {
  ADVANCED_DEFAULT_HOURS,
  ADVANCED_REALTIME_MODEL,
  applyAdvancedBalanceChange,
  clampAdvancedHours,
  formatAdvancedUsd,
  hasAdvancedTalkAccess,
  isAdvancedHoursPayment,
  isAdvancedRealtimeModel,
} from './advancedUsage';

describe('advancedUsage', () => {
  it('recognizes only gpt-realtime-2.1 as the advanced talk model', () => {
    expect(isAdvancedRealtimeModel(ADVANCED_REALTIME_MODEL)).toBe(true);
    expect(isAdvancedRealtimeModel('gpt-realtime-2.1-mini')).toBe(false);
    expect(isAdvancedRealtimeModel('gpt-realtime')).toBe(false);
    expect(isAdvancedRealtimeModel(undefined)).toBe(false);
  });

  it('requires a positive advanced balance for access', () => {
    expect(hasAdvancedTalkAccess(0)).toBe(false);
    expect(hasAdvancedTalkAccess(0.005)).toBe(false);
    expect(hasAdvancedTalkAccess(0.02)).toBe(true);
    expect(hasAdvancedTalkAccess(1)).toBe(true);
  });

  it('adds purchased hours to the advanced balance', () => {
    expect(
      applyAdvancedBalanceChange({ advancedBalanceHours: 0.5, advancedUsedHours: 1 }, 2),
    ).toEqual({
      advancedBalanceHours: 2.5,
      advancedUsedHours: 1,
    });
  });

  it('deducts usage from the advanced balance and tracks used hours', () => {
    expect(
      applyAdvancedBalanceChange({ advancedBalanceHours: 2, advancedUsedHours: 0.25 }, -0.4),
    ).toEqual({
      advancedBalanceHours: 1.6,
      advancedUsedHours: 0.65,
    });
  });

  it('identifies advanced hour payments', () => {
    expect(isAdvancedHoursPayment({ type: 'advanced-hours' })).toBe(true);
    expect(isAdvancedHoursPayment({ type: 'user' })).toBe(false);
  });

  it('clamps hour purchases between 1 and 20', () => {
    expect(clampAdvancedHours(10)).toBe(ADVANCED_DEFAULT_HOURS);
    expect(clampAdvancedHours(0)).toBe(1);
    expect(clampAdvancedHours(21)).toBe(20);
    expect(clampAdvancedHours(3.6)).toBe(4);
    expect(clampAdvancedHours(Number.NaN)).toBe(ADVANCED_DEFAULT_HOURS);
  });

  it('formats advanced prices in USD', () => {
    expect(formatAdvancedUsd(50)).toBe('$50');
    expect(formatAdvancedUsd(500)).toBe('$500');
  });
});
