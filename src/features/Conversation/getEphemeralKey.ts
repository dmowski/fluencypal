export const getEphemeralKey = async () => {
  const salt = Date.now();
  const response = await fetch("/api/token?salt=" + salt);
  const data = await response.json();
  return data.client_secret.value as string;
};
