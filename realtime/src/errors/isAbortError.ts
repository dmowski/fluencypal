/** True when a provider call was cancelled via AbortSignal (user interrupt, dispose, new turn). */
export const isAbortError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const name = 'name' in error ? String(error.name) : '';
  if (name === 'AbortError' || name === 'APIUserAbortError' || name === 'CanceledError') {
    return true;
  }

  const code = 'code' in error ? String(error.code) : '';
  if (code === 'ABORT_ERR' || code === 'ERR_CANCELED') {
    return true;
  }

  const message = 'message' in error ? String(error.message) : '';
  return /aborted|cancel/i.test(message);
};
