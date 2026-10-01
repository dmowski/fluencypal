export async function sendFluencyCallRequest(startsAtIso: string, token: string): Promise<void> {
  const response = await fetch('/api/fluency-call/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ startsAtIso }),
  });

  if (!response.ok) {
    throw new Error(`Call request failed (${response.status})`);
  }
}
