import { microsToUsd, openAiLivePricePerMinuteUsdMicros } from './pricing';

export const formatUsdFromMicros = (micros: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(microsToUsd(micros));

/** Whole-dollar packs render as "$6". Amounts with cents keep two places. */
export const formatCompactUsd = (usd: number): string => {
  const whole = Number.isInteger(usd);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(usd);
};

/** Local estimate shown under a pack, like "≈ PLN 23.29". Empty when the currency is USD. */
export const formatApproxLocalFromUsd = (usd: number, currency: string, rate: number): string => {
  const code = currency.toUpperCase();
  if (!code || code === 'USD' || !Number.isFinite(rate) || rate <= 0) return '';
  const amount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usd * rate);
  return `≈ ${code} ${amount}`;
};

export const formatLocalFromUsd = (usd: number, currency: string, rate: number): string => {
  const code = currency.toUpperCase();
  if (!code || code === 'USD' || !Number.isFinite(rate) || rate <= 0) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usd * rate);
};

export const formatBalanceLabel = (micros: number, currency: string, rate: number): string => {
  const usd = formatUsdFromMicros(micros);
  const local = formatLocalFromUsd(microsToUsd(micros), currency, rate);
  return local ? `${usd} · ${local}` : usd;
};

export type TalkTime = {
  hours: number;
  minutes: number;
};

/** Whole hours and minutes of talking. Leftover seconds are dropped. */
export const talkTimeFromBalance = (balanceUsdMicros: number): TalkTime => {
  const totalMinutes =
    !Number.isFinite(balanceUsdMicros) || balanceUsdMicros <= 0
      ? 0
      : Math.floor(balanceUsdMicros / openAiLivePricePerMinuteUsdMicros);
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
};

export const formatElapsedMs = (elapsedMs: number): string => {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
