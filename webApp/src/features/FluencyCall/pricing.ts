/** One payment covers one month. It does not renew on its own. */
export const FLUENCY_CALL_PRICE_USD = 2;

export const FLUENCY_CALL_STRIPE_PRODUCT = 'fluency-call';

export const isFluencyCallCheckout = (metadata: { product?: string } | null | undefined): boolean =>
  metadata?.product === FLUENCY_CALL_STRIPE_PRODUCT;

export const isFluencyCallPassActive = (
  activeUntilIso: string | null | undefined,
  now: Date,
): boolean => {
  if (!activeUntilIso) return false;
  const end = new Date(activeUntilIso).getTime();
  return Number.isFinite(end) && end > now.getTime();
};

/** Adds time from the later of now and the current end. */
export const extendFluencyCallAccessFor = (
  activeUntilIso: string | null | undefined,
  now: Date,
  duration: { months?: number; days?: number },
): string => {
  const currentMs = activeUntilIso ? new Date(activeUntilIso).getTime() : Number.NaN;
  const base = Number.isFinite(currentMs) && currentMs > now.getTime() ? new Date(currentMs) : now;
  const next = new Date(base.getTime());
  if (duration.months) next.setUTCMonth(next.getUTCMonth() + duration.months);
  if (duration.days) next.setUTCDate(next.getUTCDate() + duration.days);
  return next.toISOString();
};

/** Adds one month from the later of now and the current end. */
export const extendFluencyCallAccess = (
  activeUntilIso: string | null | undefined,
  now: Date,
): string => extendFluencyCallAccessFor(activeUntilIso, now, { months: 1 });

export const shortenFluencyCallAccess = (
  activeUntilIso: string | null | undefined,
  duration: { months?: number; days?: number },
): string | null => {
  if (!activeUntilIso) return null;
  const next = new Date(activeUntilIso);
  if (Number.isNaN(next.getTime())) return null;
  if (duration.months) next.setUTCMonth(next.getUTCMonth() - duration.months);
  if (duration.days) next.setUTCDate(next.getUTCDate() - duration.days);
  return next.toISOString();
};
