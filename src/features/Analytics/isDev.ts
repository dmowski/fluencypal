export const isDev = () => {
  const isWindow = typeof window !== 'undefined';
  const isLocalhost = isWindow && window.location.hostname === 'localhost';

  if (isLocalhost || !isWindow) {
    return true;
  }

  return false;
};
