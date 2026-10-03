export type FluencyCallCheckoutResponse = {
  sessionUrl: string | null;
  error: string | null;
};

export class FluencyCallApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'FluencyCallApiError';
    this.status = status;
  }
}

export const requestFluencyCallCheckout = async (
  token: string,
  body: { currency: string; languageCode: string },
): Promise<FluencyCallCheckoutResponse> => {
  const response = await fetch('/api/fluency-call/checkout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as FluencyCallCheckoutResponse;
  if (!response.ok) {
    throw new FluencyCallApiError(payload.error || 'Request failed', response.status);
  }
  return payload;
};
