/**
 * Looks up a Firebase user by email via the server-side find-by-email endpoint.
 * Returns the user's uid, or null if no user with that email exists.
 *
 * The email is sanitised to lowercase before the request is sent.
 */
export const findUserByEmail = async (
  email: string,
  getToken: () => Promise<string>,
): Promise<{ uid: string } | null> => {
  const sanitized = email.toLowerCase().trim();
  const token = await getToken();
  const response = await fetch(
    `/api/reader/users/find-by-email?email=${encodeURIComponent(sanitized)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(`Failed to find user by email: ${response.status}`);
  }

  return (await response.json()) as { uid: string };
};
