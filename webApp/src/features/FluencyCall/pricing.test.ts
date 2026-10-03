import {
  extendFluencyCallAccess,
  FLUENCY_CALL_PRICE_USD,
  FLUENCY_CALL_STRIPE_PRODUCT,
  isFluencyCallCheckout,
  isFluencyCallPassActive,
} from './pricing';

describe('fluency call month pass', () => {
  const now = new Date('2026-10-03T12:00:00.000Z');

  it('charges two dollars for the separate product', () => {
    expect(FLUENCY_CALL_PRICE_USD).toBe(2);
    expect(isFluencyCallCheckout({ product: FLUENCY_CALL_STRIPE_PRODUCT })).toBe(true);
    expect(isFluencyCallCheckout({ product: 'open-ai-live' })).toBe(false);
    expect(isFluencyCallCheckout(null)).toBe(false);
  });

  it('treats a missing or past end as inactive', () => {
    expect(isFluencyCallPassActive(null, now)).toBe(false);
    expect(isFluencyCallPassActive('2026-10-03T12:00:00.000Z', now)).toBe(false);
    expect(isFluencyCallPassActive('2026-10-03T12:00:01.000Z', now)).toBe(true);
  });

  it('starts a new month from now when the pass has ended', () => {
    expect(extendFluencyCallAccess('2026-10-01T00:00:00.000Z', now)).toBe(
      '2026-11-03T12:00:00.000Z',
    );
    expect(extendFluencyCallAccess(null, now)).toBe('2026-11-03T12:00:00.000Z');
  });

  it('extends a pass that is still running', () => {
    expect(extendFluencyCallAccess('2026-11-01T00:00:00.000Z', now)).toBe(
      '2026-12-01T00:00:00.000Z',
    );
  });
});
