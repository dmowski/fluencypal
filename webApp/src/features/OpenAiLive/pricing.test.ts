import * as pricing from './pricing';
import { talkTimeFromBalance } from './formatBalance';
import {
  OPEN_AI_LIVE_MAX_BILLING_GAP_MS,
  OPEN_AI_LIVE_STRIPE_PRODUCT,
  applyOpenAiLiveUsage,
  applyWelcomeBalance,
  chargeUsdMicrosForElapsedMs,
  creditUsdMicrosForHours,
  openAiLiveHoursFromMetadata,
  openAiLivePricePerMinuteUsd,
  openAiLivePricePerMinuteUsdMicros,
  openAiLiveWelcomeBalanceUsdMicros,
} from './pricing';

describe('openAi live user price', () => {
  it('keeps margin private and exposes the final per-minute price', () => {
    const exported = Object.keys(pricing).map((key) => key.toLowerCase());
    expect(exported.some((key) => key.includes('margin') || key.includes('api'))).toBe(false);
    expect(openAiLivePricePerMinuteUsd).toBe(0.1);
    expect(openAiLivePricePerMinuteUsdMicros).toBe(100_000);
    expect(openAiLivePricePerMinuteUsdMicros * 60).toBe(6_000_000);
  });

  it('turns a balance into whole hours and minutes of talking', () => {
    expect(talkTimeFromBalance(28_000_000)).toEqual({ hours: 4, minutes: 40 });
    expect(talkTimeFromBalance(6_000_000)).toEqual({ hours: 1, minutes: 0 });
    expect(talkTimeFromBalance(300_000)).toEqual({ hours: 0, minutes: 3 });
    expect(talkTimeFromBalance(100_000)).toEqual({ hours: 0, minutes: 1 });
    expect(talkTimeFromBalance(6_100_000)).toEqual({ hours: 1, minutes: 1 });
    expect(talkTimeFromBalance(50_000)).toEqual({ hours: 0, minutes: 0 });
    expect(talkTimeFromBalance(0)).toEqual({ hours: 0, minutes: 0 });
  });

  it('grants a one dollar welcome balance once', () => {
    expect(openAiLiveWelcomeBalanceUsdMicros).toBe(1_000_000);
    expect(applyWelcomeBalance(null)).toEqual({ balanceUsdMicros: 1_000_000, grant: true });
    expect(applyWelcomeBalance({ balanceUsdMicros: 250_000, welcomeGrantedAt: null })).toEqual({
      balanceUsdMicros: 1_250_000,
      grant: true,
    });
    expect(
      applyWelcomeBalance({
        balanceUsdMicros: 1_000_000,
        welcomeGrantedAt: '2026-10-02T00:00:00.000Z',
      }),
    ).toEqual({ balanceUsdMicros: 1_000_000, grant: false });
  });

  it('bills active time from the user price and stops at an empty balance', () => {
    expect(chargeUsdMicrosForElapsedMs(0)).toBe(0);
    expect(chargeUsdMicrosForElapsedMs(-1)).toBe(0);
    expect(chargeUsdMicrosForElapsedMs(60_000)).toBe(100_000);
    expect(chargeUsdMicrosForElapsedMs(1_000)).toBe(1_666);

    expect(applyOpenAiLiveUsage({ balanceUsdMicros: 1_000_000, elapsedMs: 60_000 })).toEqual({
      balanceUsdMicros: 900_000,
      chargedUsdMicros: 100_000,
      shouldStop: false,
    });

    expect(applyOpenAiLiveUsage({ balanceUsdMicros: 1_000, elapsedMs: 60_000 })).toEqual({
      balanceUsdMicros: 0,
      chargedUsdMicros: 1_000,
      shouldStop: true,
    });

    expect(applyOpenAiLiveUsage({ balanceUsdMicros: 0, elapsedMs: 5_000 })).toEqual({
      balanceUsdMicros: 0,
      chargedUsdMicros: 0,
      shouldStop: true,
    });
  });

  it('caps a single tick so a stalled timer cannot bill the whole gap', () => {
    const capped = applyOpenAiLiveUsage({
      balanceUsdMicros: 10_000_000,
      elapsedMs: OPEN_AI_LIVE_MAX_BILLING_GAP_MS + 60_000,
    });
    const atCap = applyOpenAiLiveUsage({
      balanceUsdMicros: 10_000_000,
      elapsedMs: OPEN_AI_LIVE_MAX_BILLING_GAP_MS,
    });
    expect(capped).toEqual(atCap);
    expect(capped.chargedUsdMicros).toBe(
      chargeUsdMicrosForElapsedMs(OPEN_AI_LIVE_MAX_BILLING_GAP_MS),
    );
  });

  it('credits hour packs at six dollars per hour', () => {
    expect(creditUsdMicrosForHours(1)).toBe(6_000_000);
    expect(creditUsdMicrosForHours(3)).toBe(18_000_000);
    expect(creditUsdMicrosForHours(10)).toBe(60_000_000);
  });

  it('accepts only live-conversation checkout metadata', () => {
    expect(openAiLiveHoursFromMetadata({ product: OPEN_AI_LIVE_STRIPE_PRODUCT, hours: '3' })).toBe(
      3,
    );
    expect(openAiLiveHoursFromMetadata({ product: OPEN_AI_LIVE_STRIPE_PRODUCT, hours: '2' })).toBe(
      null,
    );
    expect(openAiLiveHoursFromMetadata({ product: 'hours', hours: '1' })).toBe(null);
    expect(openAiLiveHoursFromMetadata(null)).toBe(null);
  });
});
