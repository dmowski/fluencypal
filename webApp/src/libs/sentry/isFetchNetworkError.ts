/**
 * Browser `fetch` failures that mean the request never reached our server
 * (offline, tab killed, iOS backgrounding). Safari reports these as
 * `TypeError: Load failed`; Chromium as `Failed to fetch`.
 */
export const isFetchNetworkError = (error: unknown): boolean => {
  if (!(error instanceof TypeError)) {
    return false;
  }

  const message = error.message;
  return (
    message === 'Load failed' ||
    message === 'Failed to fetch' ||
    message === 'NetworkError when attempting to fetch resource.' ||
    message === 'cancelled' ||
    message === 'network error'
  );
};
