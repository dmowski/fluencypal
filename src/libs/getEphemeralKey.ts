export const getEphemeralKey = async () => {
  const response = await fetch("/api/token");
  const data = await response.json();
  return data.client_secret.value;
};
