export const sendAccountLinkEmailRequest = async (authToken: string): Promise<void> => {
  const response = await fetch('/api/email/accountLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to send account link email');
  }
};
