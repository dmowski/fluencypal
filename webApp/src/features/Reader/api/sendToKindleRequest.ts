export const sendToKindleRequest = async ({
  bookId,
  kindleEmail,
  getToken,
}: {
  bookId: string;
  kindleEmail: string;
  getToken: () => Promise<string>;
}): Promise<void> => {
  const token = await getToken();
  const response = await fetch('/api/reader/sendToKindle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bookId, kindleEmail }),
  });

  if (!response.ok) {
    let message = `Failed to send to Kindle (${response.status})`;
    try {
      const json = (await response.json()) as { error?: string };
      if (json.error) message = json.error;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }
};
