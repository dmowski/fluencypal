export async function sendCommunityCallRequest(
  interests: string,
  contact: string,
  authToken?: string,
): Promise<void> {
  const response = await fetch('/api/community-call/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify({ interests, contact }),
  });

  if (!response.ok) {
    throw new Error(`Group call request failed (${response.status})`);
  }
}
