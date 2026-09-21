import { InitBalanceRequest, InitBalanceResponse } from '@/app/api/addUsageLog/usageRequest.types';

const INIT_BALANCE_RETRY_DELAY_MS = 1000;

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export type InitWelcomeBalanceRetryOptions = {
  retries?: number;
  sleep?: (ms: number) => Promise<void>;
};

export const isInitBalanceUnauthorizedError = (error: unknown): boolean =>
  error instanceof Error && /failed with status 401/.test(error.message);

const isRetryableInitBalanceStatus = (status: number) => status >= 500;

const initWelcomeBalanceRequestRaw = async (
  requestData: InitBalanceRequest,
  auth: string,
): Promise<InitBalanceResponse> => {
  const response = await fetch('/api/initBalance', {
    method: 'POST',
    body: JSON.stringify(requestData),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
  });

  if (!response.ok) {
    throw new Error(`initWelcomeBalanceRequest failed with status ${response.status}`);
  }

  return (await response.json()) as InitBalanceResponse;
};

export const initWelcomeBalanceRequest = async (
  requestData: InitBalanceRequest,
  auth: string,
  options: InitWelcomeBalanceRetryOptions = {},
): Promise<InitBalanceResponse> => {
  const retries = options.retries ?? 3;
  const sleep = options.sleep ?? defaultSleep;

  try {
    return await initWelcomeBalanceRequestRaw(requestData, auth);
  } catch (error) {
    const statusMatch =
      error instanceof Error ? error.message.match(/failed with status (\d+)/) : null;
    const status = statusMatch ? Number(statusMatch[1]) : undefined;
    const canRetry = status === undefined || isRetryableInitBalanceStatus(status);

    if (canRetry && retries > 0) {
      console.warn(
        `initWelcomeBalanceRequest failed. Retrying... (${retries} attempts left)`,
        error,
      );
      await sleep(INIT_BALANCE_RETRY_DELAY_MS);
      return initWelcomeBalanceRequest(requestData, auth, { ...options, retries: retries - 1 });
    }

    if (retries <= 0) {
      console.error('initWelcomeBalanceRequest failed after multiple attempts:', error);
    }
    throw error;
  }
};
