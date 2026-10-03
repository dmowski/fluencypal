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

/** Adds one month from the later of now and the current end. */
export const extendFluencyCallAccess = (
  activeUntilIso: string | null | undefined,
  now: Date,
): string => {
  const currentMs = activeUntilIso ? new Date(activeUntilIso).getTime() : Number.NaN;
  const base = Number.isFinite(currentMs) && currentMs > now.getTime() ? new Date(currentMs) : now;
  const next = new Date(base.getTime());
  next.setUTCMonth(next.getUTCMonth() + 1);
  return next.toISOString();
};
