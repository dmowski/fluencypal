/**
 * OpenAI lists GPT-Live at $0.05 per minute. A 50% gross margin means that
 * cost is half of the price the user pays, so the user price is $0.10/minute.
 * Margin and the API cost stay in this file. Other modules only see the user price.
 */
const API_USD_MICROS_PER_MINUTE = 50_000;
const MARGIN_OF_PRICE_NUMERATOR = 1;
const MARGIN_OF_PRICE_DENOMINATOR = 2;
const USER_USD_MICROS_PER_MINUTE =
  (API_USD_MICROS_PER_MINUTE * MARGIN_OF_PRICE_DENOMINATOR) /
  (MARGIN_OF_PRICE_DENOMINATOR - MARGIN_OF_PRICE_NUMERATOR);

export const USD_MICROS_PER_DOLLAR = 1_000_000;

/** Final user price. Margin is already included. */
export const openAiLivePricePerMinuteUsdMicros = USER_USD_MICROS_PER_MINUTE;

export const openAiLivePricePerMinuteUsd =
  openAiLivePricePerMinuteUsdMicros / USD_MICROS_PER_DOLLAR;

export const openAiLiveWelcomeBalanceUsdMicros = USD_MICROS_PER_DOLLAR;

/** One usage tick never bills more than this, so a stalled timer cannot charge a long gap. */
export const OPEN_AI_LIVE_MAX_BILLING_GAP_MS = 120_000;

/** Cover OpenAI's WebRTC startup charge before a session is allowed to begin. */
export const openAiLiveMinimumStartUsdMicros = 25_000;

export const OPEN_AI_LIVE_HOUR_PACKS = [1, 3, 10] as const;

export type OpenAiLiveHourPack = (typeof OPEN_AI_LIVE_HOUR_PACKS)[number];

export const OPEN_AI_LIVE_STRIPE_PRODUCT = 'open-ai-live';

export const microsToUsd = (micros: number): number => micros / USD_MICROS_PER_DOLLAR;

export const isOpenAiLiveHourPack = (hours: number): hours is OpenAiLiveHourPack =>
  (OPEN_AI_LIVE_HOUR_PACKS as readonly number[]).includes(hours);

export const chargeUsdMicrosForElapsedMs = (elapsedMs: number): number => {
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) return 0;
  return Math.floor((elapsedMs * openAiLivePricePerMinuteUsdMicros) / 60_000);
};

export const creditUsdMicrosForHours = (hours: number): number =>
  hours * openAiLivePricePerMinuteUsdMicros * 60;

export const applyWelcomeBalance = (
  account: { balanceUsdMicros?: number; welcomeGrantedAt?: string | null } | null,
): { balanceUsdMicros: number; grant: boolean } => {
  const current = account?.balanceUsdMicros ?? 0;
  if (account?.welcomeGrantedAt) {
    return { balanceUsdMicros: current, grant: false };
  }
  return {
    balanceUsdMicros: current + openAiLiveWelcomeBalanceUsdMicros,
    grant: true,
  };
};

export const applyOpenAiLiveUsage = ({
  balanceUsdMicros,
  elapsedMs,
  maxElapsedMs = OPEN_AI_LIVE_MAX_BILLING_GAP_MS,
}: {
  balanceUsdMicros: number;
  elapsedMs: number;
  maxElapsedMs?: number;
}): { balanceUsdMicros: number; chargedUsdMicros: number; shouldStop: boolean } => {
  const safeElapsed = Math.min(Math.max(0, elapsedMs), Math.max(0, maxElapsedMs));
  const charge = chargeUsdMicrosForElapsedMs(safeElapsed);
  const available = Math.max(0, balanceUsdMicros);
  const chargedUsdMicros = Math.min(charge, available);
  const nextBalance = available - chargedUsdMicros;
  return {
    balanceUsdMicros: nextBalance,
    chargedUsdMicros,
    shouldStop: nextBalance <= 0,
  };
};

export const openAiLiveHoursFromMetadata = (
  metadata: { product?: string; hours?: string } | null | undefined,
): OpenAiLiveHourPack | null => {
  if (metadata?.product !== OPEN_AI_LIVE_STRIPE_PRODUCT) return null;
  const hours = Number(metadata.hours);
  if (!isOpenAiLiveHourPack(hours)) return null;
  return hours;
};
