export async function sendGroupConversationRequest(
  interests: string,
  contact: string,
): Promise<void> {
  const response = await fetch('/api/group-conversations/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ interests, contact }),
  });

  if (!response.ok) {
    throw new Error(`Group call request failed (${response.status})`);
  }
}
